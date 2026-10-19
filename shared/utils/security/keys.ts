import { readFileSync } from 'node:fs';

function loadKey(envVar: string): string {
  const filePath = process.env[envVar];
  if (!filePath) {
    throw new Error(`Environment variable ${envVar} is not set`);
  }
  return readFileSync(filePath, 'utf8');
}

let accessPublicKeyCache: string | undefined;
let accessPrivateKeyCache: string | undefined;
let refreshPublicKeyCache: string | undefined;
let refreshPrivateKeyCache: string | undefined;

/** Lazy getters so services only need the key files they actually use. */
export const getAccessPublicKey = (): string =>
  (accessPublicKeyCache ??= loadKey('JWT_ACCESS_PUBLIC_KEY_PATH'));

export const getAccessPrivateKey = (): string =>
  (accessPrivateKeyCache ??= loadKey('JWT_ACCESS_PRIVATE_KEY_PATH'));

export const getRefreshPublicKey = (): string =>
  (refreshPublicKeyCache ??= loadKey('JWT_REFRESH_PUBLIC_KEY_PATH'));

export const getRefreshPrivateKey = (): string =>
  (refreshPrivateKeyCache ??= loadKey('JWT_REFRESH_PRIVATE_KEY_PATH'));
