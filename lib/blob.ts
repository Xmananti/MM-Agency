import { put, del } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const blob = await put(path, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });
  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });
  } catch (error) {
    console.error('Failed to delete blob:', error);
    // Don't throw - file deletion failures shouldn't break the app
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
}
