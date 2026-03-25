import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function uploadLocal(
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; storageKey: string }> {
  const ext = extFromMime(mimeType);
  const name = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });
  const fsPath = path.join(uploadDir, name);
  await writeFile(fsPath, buffer);
  return { url: `/uploads/gallery/${name}`, storageKey: name };
}

/** Best-effort removal of a file saved under public/uploads/gallery. */
export async function deleteLocalByUrl(url: string): Promise<void> {
  if (!url.startsWith("/uploads/gallery/")) return;
  const rel = url.replace(/^\//, "");
  const fsPath = path.join(process.cwd(), "public", rel);
  await unlink(fsPath).catch(() => {});
}
