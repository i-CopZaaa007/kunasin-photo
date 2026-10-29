import type { CategoryRow, Photo, PhotoRow } from '../data/types'
import { getClient, publicUrl, supabase } from './supabase'

export const toPhoto = (r: PhotoRow): Photo => ({
  id: r.id,
  src: publicUrl(r.src_path),
  thumb: publicUrl(r.thumb_path),
  caption: r.caption,
  category: r.category_id,
})

export async function listCategories(): Promise<CategoryRow[]> {
  const { data, error } = await getClient()
    .from('categories')
    .select('id,label,parent_id,sort_order')
    .order('sort_order')
    .order('created_at')
  if (error) throw error
  return data
}

export async function listPhotoRows(): Promise<PhotoRow[]> {
  const { data, error } = await getClient()
    .from('photos')
    .select('id,src_path,thumb_path,caption,category_id,sort_order,created_at')
    .order('sort_order')
    .order('created_at')
  if (error) throw error
  return data
}

export async function loadGallery(): Promise<{ rows: CategoryRow[]; photos: Photo[] }> {
  if (!supabase) throw new Error('ยังไม่ได้ตั้งค่า Supabase (.env.local)')
  const [rows, photoRows] = await Promise.all([listCategories(), listPhotoRows()])
  return { rows, photos: photoRows.map(toPhoto) }
}
