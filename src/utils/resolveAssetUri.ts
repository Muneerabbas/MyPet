import { Image, NativeModules, Platform } from 'react-native';

/**
 * Returns a URI for the asset that works in React Native's JS `fetch` context
 * (dev only — fixes the Metro host). In release the original URI is returned.
 */
export function resolveAssetUri(assetModule: number): string {
  const { uri } = Image.resolveAssetSource(assetModule);

  if (!uri.startsWith('http')) {
    return uri;
  }

  const scriptURL: string | undefined =
    NativeModules.SourceCode?.getConstants?.()?.scriptURL ??
    NativeModules.SourceCode?.scriptURL;

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const host = scriptURL?.match(/^https?:\/\/([^:/]+)/)?.[1] ?? fallbackHost;

  return uri.replace(/localhost|127\.0\.0\.1/g, host);
}

/**
 * Returns a URI that can be used directly as the `src` of a <model-viewer>
 * element inside a React Native WebView (release builds only).
 *
 * - Android release: Image.resolveAssetSource returns `asset:/PATH`.
 *   Chrome WebView can read Android assets via `file:///android_asset/PATH`
 *   when the page itself runs under a `file:///android_asset/` base URL and
 *   `allowUniversalAccessFromFileURLs` is enabled.
 * - iOS release: returns the `file://` bundle path as-is (WebView can use it).
 */
export function resolveWebViewModelUri(assetModule: number): {
  modelUri: string;
  baseUrl: string;
} {
  const { uri } = Image.resolveAssetSource(assetModule);

  // Android release: `asset:/PATH` → `file:///android_asset/PATH`
  if (Platform.OS === 'android') {
    const path = uri.startsWith('asset:/')
      ? uri.slice('asset:/'.length)
      : uri.replace(/^asset:\/\//, '');
    const modelUri = 'file:///android_asset/' + path;
    return { modelUri, baseUrl: 'file:///android_asset/' };
  }

  // iOS release: file:// URI — derive base dir so same-origin assets work.
  const dir = uri.substring(0, uri.lastIndexOf('/') + 1);
  return { modelUri: uri, baseUrl: dir || 'file:///' };
}
