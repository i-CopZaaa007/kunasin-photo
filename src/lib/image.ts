export type Encoded = { blob: Blob; ext: string }

const EXT: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

async function encode(file: File, maxEdge: number, quality: number): Promise<Encoded> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) throw new Error('แปลงรูปไม่สำเร็จ')
  // บางเบราว์เซอร์ (Safari เก่า) เขียน webp ไม่ได้ จะคืน png แทน -> ใช้นามสกุลตามชนิดจริง
  return { blob, ext: EXT[blob.type] ?? 'webp' }
}

/** ย่อรูปในเบราว์เซอร์ก่อนอัปโหลด: รูปเต็ม ≤2560px และ thumbnail 900px (ประหยัดพื้นที่ฟรี 1 GB) */
export async function makeVariants(file: File) {
  return { full: await encode(file, 2560, 0.88), thumb: await encode(file, 900, 0.8) }
}
