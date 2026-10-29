import { useCallback, useMemo, useState } from 'react'
import type { Category, CategoryRow, Photo } from '../data/types'
import { buildTree } from '../lib/categories'

const STORAGE_KEY = 'lastFilter'

const readStoredFilter = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'all'
  } catch {
    // localStorage ใช้ไม่ได้ (private mode ฯลฯ) ก็ใช้ค่าเริ่มต้น
    return 'all'
  }
}

export function usePhotos(rows: CategoryRow[], photos: Photo[]) {
  const [stored, setStored] = useState(readStoredFilter)

  // filter ที่จำไว้อาจถูกลบไปแล้ว -> กลับไป All
  const filter = stored === 'all' || rows.some((r) => r.id === stored) ? stored : 'all'

  const setFilter = useCallback((id: string) => {
    setStored(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ไม่เป็นไร
    }
  }, [])

  const menu = useMemo<Category[]>(() => [{ id: 'all', label: 'All' }, ...buildTree(rows)], [rows])

  const counts = useMemo(() => {
    const own: Record<string, number> = {}
    for (const ph of photos) if (ph.category) own[ph.category] = (own[ph.category] ?? 0) + 1
    const map: Record<string, number> = { all: photos.length }
    for (const r of rows) {
      map[r.id] = (own[r.id] ?? 0) + rows.filter((c) => c.parent_id === r.id).reduce((n, c) => n + (own[c.id] ?? 0), 0)
    }
    return map
  }, [rows, photos])

  const visible = useMemo(() => {
    if (filter === 'all') return photos
    const ids = new Set([filter, ...rows.filter((r) => r.parent_id === filter).map((r) => r.id)])
    return photos.filter((ph) => ph.category && ids.has(ph.category))
  }, [filter, rows, photos])

  const labelOf = useCallback(
    (id: string | null) => rows.find((r) => r.id === id)?.label ?? '',
    [rows],
  )

  const title = filter === 'all' ? 'My Photo' : labelOf(filter)

  return { menu, filter, setFilter, counts, visible, title, labelOf }
}
