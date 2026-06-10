import { resolveAssetUri } from './resolveAssetUri';

function btoaPolyfill(input: string): string {
  const g = globalThis as unknown as { btoa?: (s: string) => string };
  if (typeof g.btoa !== 'function') {
    throw new Error('btoa is not available');
  }
  return g.btoa(input);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }

  return btoaPolyfill(binary);
}

/** Fetch the bundled GLB on the RN side and embed as a data URI for WebView. */
export async function loadGlbDataUri(assetModule: number): Promise<string> {
  const uri = resolveAssetUri(assetModule);
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Failed to fetch model (${response.status}) from ${uri}`);
  }

  const buffer = await response.arrayBuffer();
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));

  if (magic !== 'glTF') {
    throw new Error('Asset is not a valid GLB file');
  }

  return `data:model/gltf-binary;base64,${arrayBufferToBase64(buffer)}`;
}
