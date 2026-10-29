import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// หน้าหลังบ้านโหลดแยก (code splitting) ผู้เข้าชมทั่วไปไม่ต้องโหลดโค้ดส่วนนี้
const Admin = lazy(() => import('./admin/Admin.tsx'))
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
