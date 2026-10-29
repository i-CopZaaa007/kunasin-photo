import { useEffect, useState } from 'react'
import type { CategoryRow, Photo } from '../data/types'
import { loadGallery } from '../lib/gallery'

type State = { rows: CategoryRow[]; photos: Photo[]; loading: boolean; error: string | null }

export function useGallery(): State {
  const [state, setState] = useState<State>({ rows: [], photos: [], loading: true, error: null })

  useEffect(() => {
    let alive = true
    loadGallery()
      .then((data) => alive && setState({ ...data, loading: false, error: null }))
      .catch((e: unknown) => {
        if (!alive) return
        const message = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ'
        setState((s) => ({ ...s, loading: false, error: message }))
      })
    return () => {
      alive = false
    }
  }, [])

  return state
}
