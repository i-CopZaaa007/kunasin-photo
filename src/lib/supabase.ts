import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** null ถ้ายังไม่ได้ตั้งค่า env */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export const BUCKET = 'photos'

/** ใช้ในหน้า admin ที่เช็กแล้วว่าตั้งค่าครบ */
export function getClient(): SupabaseClient {
  if (!supabase) throw new Error('ยังไม่ได้ตั้งค่า Supabase (.env.local)')
  return supabase
}

export const publicUrl = (path: string) => getClient().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
