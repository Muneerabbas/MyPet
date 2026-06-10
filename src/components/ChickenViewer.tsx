import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { loadGlbDataUri } from '../utils/loadGlbDataUri';

/**
 * `pose` is the GLB clip name to loop (e.g. "bunnyhop", "idle01"), or
 * "static" to show the model standing still in its rest pose.
 */
interface ChickenViewerProps {
  pose?: string;
  width: number;
  height: number;
  style?: ViewStyle;
  /** Called once a one-shot pose animation finishes playing. */
  onPoseComplete?: () => void;
  /** Called when the user taps the chicken. */
  onTap?: () => void;
}

const buildHtml = (modelDataUri: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    model-viewer {
      width: 100%;
      height: 100%;
      background: transparent;
      --progress-bar-color: transparent;
      --poster-color: transparent;
    }
  </style>
</head>
<body>
  <model-viewer
    id="mv"
    src=${JSON.stringify(modelDataUri)}
    camera-orbit="0deg 82deg auto"
    field-of-view="22deg"
    camera-target="auto auto auto"
    interaction-prompt="none"
    disable-zoom
    disable-pan
    disable-tap
    touch-action="none"
    shadow-intensity="0"
    exposure="1.15"
    environment-image="neutral"
  ></model-viewer>
  <script type="module">
    await customElements.whenDefined('model-viewer');

    const mv = document.getElementById('mv');

    function lockFraming() {
      mv.updateFraming();
      const orbit = mv.getCameraOrbit();
      const radius = (orbit.radius * 0.82).toFixed(4) + 'm';
      // Lock the radius so per-frame animation bounds can't re-zoom the model.
      mv.minCameraOrbit = 'auto auto ' + radius;
      mv.maxCameraOrbit = 'auto auto ' + radius;
      mv.cameraOrbit = orbit.theta + 'rad ' + orbit.phi + 'rad ' + radius;
      mv.minFieldOfView = '22deg';
      mv.maxFieldOfView = '22deg';
    }

    mv.addEventListener('load', () => {
      // Frame once the model is in, then again next frame after the
      // animation's first pose so the locked size is stable.
      lockFraming();
      requestAnimationFrame(lockFraming);
      window.ReactNativeWebView?.postMessage('ready');
    });

    mv.addEventListener('error', (event) => {
      const msg = event.detail?.sourceError?.message || 'model-viewer error';
      window.ReactNativeWebView?.postMessage('error:' + msg);
    });

    // Clip used for the calm standing "static" look (falls back to rest pose).
    const STATIC_CLIP = 'idle01';
    let watchRaf = null;

    function cancelWatch() {
      if (watchRaf) {
        cancelAnimationFrame(watchRaf);
        watchRaf = null;
      }
    }

    function goStatic() {
      cancelWatch();
      const available = mv.availableAnimations || [];
      if (available.includes(STATIC_CLIP)) {
        mv.animationName = STATIC_CLIP;
      }
      mv.currentTime = 0;
      mv.pause();
    }

    window.setPose = (pose) => {
      cancelWatch();

      const available = mv.availableAnimations || [];
      if (!pose || pose === 'static' || !available.includes(pose)) {
        goStatic();
        return;
      }

      mv.animationName = pose;
      mv.currentTime = 0;
      mv.play();

      // model-viewer loops by default and ignores repetitions on some builds.
      // Watch the timeline and stop after exactly one full cycle: either the
      // time reaches the clip duration, or it wraps back toward zero.
      let prev = 0;
      const watch = () => {
        const t = mv.currentTime;
        const dur = mv.duration;

        const wrapped = t + 0.0001 < prev;
        const reachedEnd = dur && isFinite(dur) && dur > 0 && t >= dur - 0.03;

        if (wrapped || reachedEnd) {
          watchRaf = null;
          goStatic();
          window.ReactNativeWebView?.postMessage('finished');
          return;
        }

        prev = t;
        watchRaf = requestAnimationFrame(watch);
      };
      watchRaf = requestAnimationFrame(watch);
    };

    // Tapping anywhere on the model notifies React Native.
    document.body.addEventListener('pointerup', () => {
      window.ReactNativeWebView?.postMessage('tap');
    });

    window.onerror = (message) => {
      window.ReactNativeWebView?.postMessage('error:' + message);
    };
  </script>
</body>
</html>`;

export const ChickenViewer: React.FC<ChickenViewerProps> = ({
  pose = 'static',
  width,
  height,
  style,
  onPoseComplete,
  onTap,
}) => {
  const webViewRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const [modelDataUri, setModelDataUri] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGlbDataUri(require('../assets/model/chicken.glb'))
      .then((uri) => {
        if (!cancelled) {
          setModelDataUri(uri);
          setLoadError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setLoadError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sendPose = useCallback((next: string) => {
    webViewRef.current?.injectJavaScript(
      `window.setPose && window.setPose(${JSON.stringify(next)}); true;`,
    );
  }, []);

  useEffect(() => {
    if (readyRef.current) {
      sendPose(pose);
    }
  }, [pose, sendPose]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = event.nativeEvent.data;
      if (data === 'ready') {
        readyRef.current = true;
        setLoadError(null);
        sendPose(pose);
      } else if (data === 'finished') {
        onPoseComplete?.();
      } else if (data === 'tap') {
        onTap?.();
      } else if (data.startsWith('error:')) {
        setLoadError(data.slice(6));
      }
    },
    [pose, sendPose, onPoseComplete, onTap],
  );

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      {modelDataUri ? (
        <WebView
          ref={webViewRef}
          source={{ html: buildHtml(modelDataUri), baseUrl: 'https://app.local' }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          androidLayerType="hardware"
          webviewDebuggingEnabled={__DEV__}
          onMessage={onMessage}
          onError={(e) => setLoadError(e.nativeEvent.description)}
          {...(Platform.OS === 'ios' ? { opaque: false } : {})}
        />
      ) : loadError ? null : (
        <ActivityIndicator style={styles.loader} color="#fff" />
      )}

      {loadError ? (
        <View style={styles.errorBanner} pointerEvents="none">
          <Text style={styles.errorText} numberOfLines={4}>
            {loadError}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    flex: 1,
  },
  errorBanner: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,80,80,0.85)',
  },
  errorText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
});
