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
import { resolveWebViewModelUri } from '../utils/resolveAssetUri';
import { MODEL_VIEWER_JS_B64 } from '../utils/modelViewerSource';

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
  /** Called when a pose animation starts, with its duration in ms. */
  onPoseStart?: (durationMs: number) => void;
  /** Called when the user taps the chicken. */
  onTap?: () => void;
}

const buildHtml = (modelDataUri: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
    const rn = window.ReactNativeWebView;
    const dbg = (msg) => rn?.postMessage('dbg:' + msg);

    window.onerror = (message, _src, _line, _col, err) => {
      rn?.postMessage('error:' + (err?.stack || message));
    };
    window.addEventListener('unhandledrejection', (e) => {
      rn?.postMessage('error:unhandled-rejection:' + (e.reason?.stack || e.reason));
    });

    try {
      dbg('decoding-model-viewer');
      const src = atob('${MODEL_VIEWER_JS_B64}');
      dbg('creating-blob');
      const blob = new Blob([src], { type: 'text/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      dbg('importing-blob:' + blobUrl.slice(0, 40));
      await import(blobUrl);
      URL.revokeObjectURL(blobUrl);
      dbg('import-done');
    } catch (e) {
      rn?.postMessage('error:mv-load:' + (e?.stack || e?.message || e));
      throw e;
    }

    dbg('waiting-for-custom-element');
    await customElements.whenDefined('model-viewer');
    dbg('custom-element-ready');

    const mv = document.getElementById('mv');

    function lockFraming() {
      mv.updateFraming();
      const orbit = mv.getCameraOrbit();
      const radius = (orbit.radius * 0.82).toFixed(4) + 'm';
      mv.minCameraOrbit = 'auto auto ' + radius;
      mv.maxCameraOrbit = 'auto auto ' + radius;
      mv.cameraOrbit = orbit.theta + 'rad ' + orbit.phi + 'rad ' + radius;
      mv.minFieldOfView = '22deg';
      mv.maxFieldOfView = '22deg';
    }

    mv.addEventListener('load', () => {
      dbg('model-load-event');
      lockFraming();
      requestAnimationFrame(lockFraming);
      rn?.postMessage('ready');
    });

    mv.addEventListener('error', (event) => {
      const msg = event.detail?.sourceError?.message || 'model-viewer error';
      rn?.postMessage('error:' + msg);
    });

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

      let prev = 0;
      let started = false;
      const watch = () => {
        const t = mv.currentTime;
        const dur = mv.duration;

        if (!started && dur && isFinite(dur) && dur > 0) {
          started = true;
          rn?.postMessage('start:' + dur);
        }

        const wrapped = t + 0.0001 < prev;
        const reachedEnd = dur && isFinite(dur) && dur > 0 && t >= dur - 0.03;

        if (wrapped || reachedEnd) {
          watchRaf = null;
          goStatic();
          rn?.postMessage('finished');
          return;
        }

        prev = t;
        watchRaf = requestAnimationFrame(watch);
      };
      watchRaf = requestAnimationFrame(watch);
    };

    document.body.addEventListener('pointerup', () => {
      rn?.postMessage('tap');
    });
  </script>
</body>
</html>`;

export const ChickenViewer: React.FC<ChickenViewerProps> = ({
  pose = 'static',
  width,
  height,
  style,
  onPoseComplete,
  onPoseStart,
  onTap,
}) => {
  const webViewRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const [modelUri, setModelUri] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://app.local');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const glbModule = require('../assets/model/chicken.glb');

    if (__DEV__) {
      // Dev: Metro serves assets over HTTP. Fetch and embed as data URI so the
      // WebView never makes a cross-origin request to Metro (which rejects
      // requests from non-localhost origins).
      loadGlbDataUri(glbModule)
        .then((uri) => {
          if (!cancelled) {
            setModelUri(uri);
            setBaseUrl('https://app.local');
          }
        })
        .catch((err: Error) => {
          if (!cancelled) setLoadError(err.message);
        });
    } else {
      // Release: resolve the bundled asset path synchronously and pass it
      // directly to model-viewer — no JS fetch needed.
      const resolved = resolveWebViewModelUri(glbModule);
      setModelUri(resolved.modelUri);
      setBaseUrl(resolved.baseUrl);
    }

    return () => { cancelled = true; };
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
      } else if (data.startsWith('start:')) {
        const seconds = parseFloat(data.slice(6));
        if (!Number.isNaN(seconds)) {
          onPoseStart?.(seconds * 1000);
        }
      } else if (data.startsWith('error:')) {
        setLoadError(data.slice(6));
      } else if (data.startsWith('dbg:')) {
        if (__DEV__) {
          console.log('[ChickenViewer]', data.slice(4));
        }
        setLoadError(data.slice(4));
      }
    },
    [pose, sendPose, onPoseComplete, onPoseStart, onTap],
  );

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      {!modelUri && !loadError && (
        <ActivityIndicator style={styles.loader} color="#fff" />
      )}
      {modelUri && (
      <WebView
        ref={webViewRef}
        source={{ html: buildHtml(modelUri), baseUrl }}
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
