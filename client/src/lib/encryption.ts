// Client-side encryption utilities for sensitive data
import { nanoid } from 'nanoid';

/**
 * Simple client-side encryption using Web Crypto API
 * This provides protection for sensitive user data before transmission
 */

// Generate or retrieve encryption key from localStorage
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem('user-encryption-key');
  
  if (stored) {
    try {
      const keyData = JSON.parse(stored);
      return await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyData),
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to import stored key, generating new one');
    }
  }
  
  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Store key for future use
  const exported = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem('user-encryption-key', JSON.stringify(Array.from(new Uint8Array(exported))));
  
  return key;
}

// Encrypt sensitive text data
export async function encryptSensitiveData(plaintext: string): Promise<string> {
  if (!plaintext || plaintext.trim() === '') {
    return plaintext;
  }
  
  try {
    const key = await getOrCreateEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const encoder = new TextEncoder();
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );
    
    // Combine IV and ciphertext for storage
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Return base64 encoded result with prefix
    const bytes = Array.from(combined);
    return 'encrypted:' + btoa(String.fromCharCode.apply(null, bytes as any));
  } catch (error) {
    console.error('Encryption failed:', error);
    return plaintext; // Fallback to unencrypted
  }
}

// Decrypt sensitive text data
export async function decryptSensitiveData(ciphertext: string): Promise<string> {
  if (!ciphertext || !ciphertext.startsWith('encrypted:')) {
    return ciphertext; // Return as-is if not encrypted
  }
  
  try {
    const key = await getOrCreateEncryptionKey();
    const combined = new Uint8Array(
      atob(ciphertext.slice(10)).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return ciphertext; // Return as-is if decryption fails
  }
}

// Utility to check if data is encrypted
export function isEncrypted(data: string): boolean {
  return !!(data && data.startsWith('encrypted:'));
}

// Encrypt journal entry sensitive fields
export async function encryptJournalEntry(entry: any) {
  const sensitiveFields = ['content', 'highlights', 'gratitude', 'challenges', 'tomorrowGoals'];
  const encrypted = { ...entry };
  
  for (const field of sensitiveFields) {
    if (encrypted[field]) {
      encrypted[field] = await encryptSensitiveData(encrypted[field]);
    }
  }
  
  return encrypted;
}

// Decrypt journal entry sensitive fields
export async function decryptJournalEntry(entry: any) {
  if (!entry) return entry;
  
  const sensitiveFields = ['content', 'highlights', 'gratitude', 'challenges', 'tomorrowGoals'];
  const decrypted = { ...entry };
  
  for (const field of sensitiveFields) {
    if (decrypted[field]) {
      decrypted[field] = await decryptSensitiveData(decrypted[field]);
    }
  }
  
  return decrypted;
}

// Encrypt note content
export async function encryptNoteContent(content: string): Promise<string> {
  return await encryptSensitiveData(content);
}

// Decrypt note content
export async function decryptNoteContent(content: string): Promise<string> {
  return await decryptSensitiveData(content);
}

// Clear encryption key (for logout/reset)
export function clearEncryptionKey(): void {
  localStorage.removeItem('user-encryption-key');
}

// Generate a new encryption key (for security reset)
export async function regenerateEncryptionKey(): Promise<void> {
  clearEncryptionKey();
  await getOrCreateEncryptionKey();
}