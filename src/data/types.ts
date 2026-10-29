export type Photo = {
  id: string
  src: string
  thumb: string
  caption: string
  category: string | null
}

/** แถวในตาราง categories */
export type CategoryRow = {
  id: string
  label: string
  parent_id: string | null
  sort_order: number
}

/** หมวดแบบต้นไม้ (ใช้ในเมนู) */
export type Category = {
  id: string
  label: string
  children?: Category[]
}

/** แถวในตาราง photos */
export type PhotoRow = {
  id: string
  src_path: string
  thumb_path: string
  caption: string
  category_id: string | null
  sort_order: number
  created_at: string
}
