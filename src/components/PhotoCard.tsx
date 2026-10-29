import type { Photo } from '../data/types'

type Props = { photo: Photo; categoryName: string; onOpen: () => void }

export default function PhotoCard({ photo, categoryName, onOpen }: Props) {
  return (
    <button
      type="button"
      data-card
      aria-label={`ดูรูป ${photo.caption}`}
      onClick={onOpen}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-[8px] border border-white/[0.08] bg-panel p-0"
    >
      <img
        src={photo.thumb}
        alt={photo.caption}
        loading="lazy"
        decoding="async"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        // pointer-events-none: คลิกถูกส่งให้ปุ่ม กันลาก/กดค้างเพื่อเซฟรูป
        className="pointer-events-none block h-auto min-h-[120px] w-full transition-transform duration-500 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent p-3 pt-12 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block text-sm font-semibold text-fg">{photo.caption}</span>
        <span className="block text-xs text-gray-400">{categoryName}</span>
      </span>
    </button>
  )
}
