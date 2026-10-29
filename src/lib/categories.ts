import type { Category, CategoryRow } from '../data/types'

/** แปลงแถวแบนๆ เป็นต้นไม้ 2 ชั้น (rows ต้องเรียงตาม sort_order มาแล้ว) */
export function buildTree(rows: CategoryRow[]): Category[] {
  const kids = new Map<string, Category[]>()
  for (const r of rows) {
    if (r.parent_id) kids.set(r.parent_id, [...(kids.get(r.parent_id) ?? []), { id: r.id, label: r.label }])
  }
  return rows
    .filter((r) => !r.parent_id)
    .map((r) => {
      const children = kids.get(r.id)
      return children ? { id: r.id, label: r.label, children } : { id: r.id, label: r.label }
    })
}
