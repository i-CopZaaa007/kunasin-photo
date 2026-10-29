import Footer from './components/Footer'
import Gallery from './components/Gallery'
import Lightbox from './components/Lightbox'
import Navbar from './components/Navbar'
import PageTitle from './components/PageTitle'
import { useGallery } from './hooks/useGallery'
import { useLightbox } from './hooks/useLightbox'
import { usePhotos } from './hooks/usePhotos'

export default function App() {
  const { rows, photos, loading, error } = useGallery()
  const { menu, filter, setFilter, counts, visible, title, labelOf } = usePhotos(rows, photos)
  const lightbox = useLightbox(visible.length)
  const current = lightbox.index === null ? undefined : visible[lightbox.index]

  return (
    <>
      <Navbar categories={menu} filter={filter} counts={counts} onSelect={setFilter} />
      <main className="mx-auto max-w-[1800px]">
        <PageTitle title={title} />
        {loading ? (
          <p className="py-12 text-center text-muted">กำลังโหลด…</p>
        ) : error ? (
          <p className="py-12 text-center text-muted">โหลดรูปไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง</p>
        ) : (
          <Gallery photos={visible} labelOf={labelOf} onOpen={lightbox.open} />
        )}
      </main>
      <Footer />
      {current && (
        <Lightbox
          photo={current}
          onClose={lightbox.close}
          onPrev={lightbox.prev}
          onNext={lightbox.next}
          swipe={lightbox.swipe}
        />
      )}
    </>
  )
}
