import { Image, NativeModules, Platform } from 'react-native';

/** Metro serves assets at localhost — WebView needs the real dev-server host. */
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
