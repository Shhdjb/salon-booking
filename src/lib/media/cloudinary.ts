import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function configure(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadToCloudinary(
  buffer: Buffer,
  _mimeType: string
): Promise<{ url: string; storageKey: string }> {
  configure();
  const folder = process.env.CLOUDINARY_GALLERY_FOLDER?.trim() || "salon-booking/gallery";

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image", overwrite: false },
        (err, res) => {
          if (err || !res?.secure_url || !res.public_id) {
            reject(err ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({ secure_url: res.secure_url, public_id: res.public_id });
        }
      );
      stream.end(buffer);
    }
  );

  return { url: result.secure_url, storageKey: result.public_id };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  configure();
  await cloudinary.uploader.destroy(publicId);
}
