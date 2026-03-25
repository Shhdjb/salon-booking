import { isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { uploadLocal, deleteLocalByUrl } from "./local";

export type GalleryUploadResult = { url: string; storageKey: string | null };

/**
 * Upload gallery image: Cloudinary when configured, otherwise local public/uploads/gallery.
 */
export async function uploadGalleryImage(
  buffer: Buffer,
  mimeType: string
): Promise<GalleryUploadResult> {
  if (isCloudinaryConfigured()) {
    const r = await uploadToCloudinary(buffer, mimeType);
    return { url: r.url, storageKey: r.storageKey };
  }
  const r = await uploadLocal(buffer, mimeType);
  return { url: r.url, storageKey: r.storageKey };
}

/**
 * Remove stored asset after soft-delete or replace (best-effort).
 */
export async function removeGalleryAsset(
  storageKey: string | null | undefined,
  url: string
): Promise<void> {
  if (isCloudinaryConfigured() && storageKey) {
    await deleteFromCloudinary(storageKey).catch((e) =>
      console.error("[media] cloudinary destroy failed", e)
    );
    return;
  }
  await deleteLocalByUrl(url);
}

export { isCloudinaryConfigured };
