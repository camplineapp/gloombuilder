import { createClient } from "@/lib/supabase";

const TARGET_SIZE = 256;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const WEBP_QUALITY = 0.85;

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image too large (max 10MB)");
  }

  const bitmap = await createImageBitmap(file);

  const minDim = Math.min(bitmap.width, bitmap.height);
  const cropX = (bitmap.width - minDim) / 2;
  const cropY = (bitmap.height - minDim) / 2;

  let blob: Blob;
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(TARGET_SIZE, TARGET_SIZE);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(
      bitmap,
      cropX, cropY, minDim, minDim,
      0, 0, TARGET_SIZE, TARGET_SIZE
    );
    blob = await canvas.convertToBlob({
      type: "image/webp",
      quality: WEBP_QUALITY,
    });
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(
      bitmap,
      cropX, cropY, minDim, minDim,
      0, 0, TARGET_SIZE, TARGET_SIZE
    );
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("Encode failed")),
        "image/webp",
        WEBP_QUALITY
      );
    });
  }

  bitmap.close?.();

  const supabase = createClient();
  const path = `${userId}/avatar.webp`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, blob, {
      upsert: true,
      contentType: "image/webp",
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return `${data.publicUrl}?v=${Date.now()}`;
}
