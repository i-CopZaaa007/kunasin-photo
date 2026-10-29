export const input =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none'
export const btn =
  'inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
export const btnPrimary =
  'inline-flex cursor-pointer items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
export const btnDanger =
  'inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
export const card = 'rounded-xl border border-white/[0.08] bg-panel p-4'

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'เกิดข้อผิดพลาด')
