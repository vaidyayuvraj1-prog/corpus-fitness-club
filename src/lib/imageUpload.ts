/**
 * Client-Side Image Processor & Compressor
 * Allows users to pick photos directly from device gallery/camera WITHOUT external image links.
 * Automatically resizes & compresses images for ultra-fast uploads and minimal database storage.
 */

export interface ProcessImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.82 } = options

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WEBP)'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image from device'))
    reader.onload = (event) => {
      const src = event.target?.result as string
      const img = new Image()

      img.onerror = () => reject(new Error('Failed to process image format'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(src)
          return
        }

        // Smooth image downscaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }

      img.src = src
    }

    reader.readAsDataURL(file)
  })
}
