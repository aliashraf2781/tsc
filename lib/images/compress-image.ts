export type CompressImageOptions = {
  maxWidth?: number
  maxHeight?: number
  maxBytes?: number
  quality?: number
  mimeType?: "image/jpeg" | "image/webp" | "image/png"
}

const DEFAULTS: Required<CompressImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  maxBytes: 900 * 1024,
  quality: 0.82,
  mimeType: "image/jpeg",
}

function determineMimeType(file: File, mimeType: string): string {
  if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpeg") {
    return file.type
  }
  return mimeType
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

function scaleDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(1, maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

/**
 * Resize and re-encode images in the browser before upload (faster POST, smaller payloads).
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (!file.type.startsWith("image/")) return file

  const opts = { ...DEFAULTS, ...options }
  const mimeType = determineMimeType(file, opts.mimeType)
  if (file.size <= opts.maxBytes && file.type === mimeType) {
    return file
  }

  const img = await loadImage(file)
  const { width, height } = scaleDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth,
    opts.maxHeight
  )

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, width, height)

  let quality = opts.quality
  let blob = await canvasToBlob(canvas, mimeType, quality)
  if (!blob) return file

  while (blob.size > opts.maxBytes && quality > 0.45) {
    quality -= 0.08
    blob = (await canvasToBlob(canvas, mimeType, quality)) ?? blob
  }

  if (blob.size >= file.size) {
    return file
  }

  const extension = mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg"
  const baseName = file.name.replace(/\.[^.]+$/, "") || "job-image"
  return new File([blob], `${baseName}.${extension}`, {
    type: mimeType,
    lastModified: Date.now(),
  })
}
