export const SOCIAL_SIZES: Record<
  string,
  { width: number; height: number; label: string }
> = {
  "instagram-post": { width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  "instagram-story": { width: 1080, height: 1920, label: "Instagram Story" },
  "facebook-post": { width: 1200, height: 630, label: "Facebook Post" },
  "twitter-post": { width: 1200, height: 675, label: "Twitter/X Post" },
  "linkedin-banner": { width: 1584, height: 396, label: "LinkedIn Banner" },
  "linkedin-post": { width: 1200, height: 627, label: "LinkedIn Post" },
  "pinterest-pin": { width: 1000, height: 1500, label: "Pinterest Pin" },
  "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail" },
};

export async function resizeImage(
  file: File,
  width: number,
  height: number
): Promise<Blob> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      "image/jpeg",
      0.9
    );
  });
}
