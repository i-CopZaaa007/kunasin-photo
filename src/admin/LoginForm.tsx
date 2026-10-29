import { useState, type FormEvent } from 'react'
import { getClient } from '../lib/supabase'
import { btnPrimary, card, input } from './ui'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await getClient().auth.signInWithPassword({ email, password })
    // ไม่บอกว่าผิดที่อีเมลหรือรหัสผ่าน
    if (error) setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className={`${card} w-full max-w-sm space-y-4`}>
        <h1 className="text-xl font-extrabold tracking-[0.2em]">KUNASIN PHOTO</h1>
        <p className="text-sm text-muted">เข้าสู่ระบบหลังบ้าน</p>
        <input
          className={input}
          type="email"
          placeholder="อีเมล"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={input}
          type="password"
          placeholder="รหัสผ่าน"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
