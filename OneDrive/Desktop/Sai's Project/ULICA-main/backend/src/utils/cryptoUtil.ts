import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env['APP_ENCRYPTION_KEY']
  ? crypto
      .createHash('sha256')
      .update(process.env['APP_ENCRYPTION_KEY'])
      .digest()
  : null;

export function encryptValue(plainText: string): { value: string; encrypted: boolean } {
  if (!KEY) {
    return { value: plainText, encrypted: false };
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, authTag, encrypted]).toString('base64');
  return { value: payload, encrypted: true };
}

export function decryptValue(payload: string, encrypted: boolean): string {
  if (!encrypted || !KEY) {
    return payload;
  }

  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const data = buffer.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return decrypted;
}
