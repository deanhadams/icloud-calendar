import { Check, Copy, Key, Lock, Mail, Plus, Settings, Shield, User, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { SETUP_STEPS } from './setupSteps'
import { SlideArrowButton, SlideDots } from './SlideshowControls'
import { useSlideshow } from './useSlideshow'

function MockRow({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] ${
        active ? 'bg-cobalt-tint font-medium text-cobalt' : 'text-ink-muted'
      }`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function MockButton({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-cobalt px-3 py-1.5 text-[11px] font-medium text-white">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

function MockInputField({ placeholder }: { placeholder: string }) {
  return (
    <div className="rounded border border-line bg-paper px-2 py-1.5 text-[11px] text-ink-muted">{placeholder}</div>
  )
}

function BrowserFrame({ addressLabel, children }: { addressLabel: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-paper px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
          <span className="h-2 w-2 rounded-full bg-line" />
        </div>
        <div className="flex-1 truncate rounded border border-line bg-white px-2 py-0.5 font-mono text-[10px] text-ink-muted">
          {addressLabel}
        </div>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}

const ILLUSTRATIONS: ReactNode[] = [
  // 1. Sign in
  <div className="flex h-full flex-col items-center justify-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cobalt-tint">
      <Lock className="h-4 w-4 text-cobalt" />
    </div>
    <p className="text-xs font-medium text-ink">Apple ID</p>
    <div className="w-40 space-y-1.5">
      <MockInputField placeholder="Email or Phone" />
      <MockInputField placeholder="Password" />
    </div>
    <MockButton>Sign In</MockButton>
  </div>,

  // 2. Open Sign-In and Security
  <div className="flex h-full gap-3">
    <div className="w-40 shrink-0 space-y-1 border-r border-line pr-3">
      <MockRow icon={User} label="Personal Info" />
      <MockRow icon={Shield} label="Sign-In and Security" active />
      <MockRow icon={Settings} label="Devices" />
      <MockRow icon={Mail} label="iCloud" />
    </div>
    <div className="flex-1 rounded-md bg-paper/60" />
  </div>,

  // 3. Select App-Specific Passwords
  <div className="flex h-full flex-col justify-center gap-1.5">
    <p className="mb-1 text-[10px] font-semibold tracking-wide text-ink-muted uppercase">Sign-In and Security</p>
    <MockRow icon={Lock} label="Password" />
    <MockRow icon={Shield} label="Two-Factor Authentication" />
    <MockRow icon={Key} label="App-Specific Passwords" active />
    <MockRow icon={Settings} label="Devices" />
  </div>,

  // 4. Generate a new password
  <div className="flex h-full flex-col items-center justify-center gap-2.5">
    <Key className="h-5 w-5 text-cobalt" />
    <p className="text-xs font-medium text-ink">App-Specific Passwords</p>
    <p className="max-w-[200px] text-center text-[11px] text-ink-muted">No app-specific passwords yet.</p>
    <MockButton icon={Plus}>Generate password</MockButton>
  </div>,

  // 5. Label it
  <div className="flex h-full items-center justify-center">
    <div className="w-48 rounded-md border border-line bg-white p-3 shadow-sm">
      <p className="mb-1.5 text-[11px] font-semibold text-ink">Password Label</p>
      <div className="rounded border border-cobalt bg-cobalt-tint px-2 py-1.5 font-mono text-[11px] text-ink">
        Syncal
      </div>
      <div className="mt-2.5 flex justify-end gap-2">
        <span className="rounded border border-line px-2 py-1 text-[10px] text-ink-muted">Cancel</span>
        <MockButton>Create</MockButton>
      </div>
    </div>
  </div>,

  // 6. Copy the generated password
  <div className="flex h-full items-center justify-center">
    <div className="w-52 rounded-md border border-line bg-white p-3 text-center shadow-sm">
      <p className="mb-1.5 text-[11px] font-semibold text-ink">Syncal</p>
      <div className="flex items-center justify-between gap-2 rounded border border-line bg-paper px-2 py-1.5">
        <span className="font-mono text-[11px] text-ink">abcd-efgh-ijkl-mnop</span>
        <Copy className="h-3.5 w-3.5 shrink-0 text-cobalt" />
      </div>
      <p className="mt-2 text-[10px] text-ink-muted">Shown once — copy it now.</p>
    </div>
  </div>,

  // 7. Paste it into Syncal
  <div className="flex h-full flex-col items-center justify-center gap-2">
    <p className="text-xs font-semibold text-ink">Add a calendar</p>
    <div className="w-48 space-y-1.5">
      <MockInputField placeholder="iCloud email" />
      <div className="flex items-center justify-between gap-2 rounded border border-cobalt bg-cobalt-tint px-2 py-1.5">
        <span className="truncate font-mono text-[10px] text-ink">abcd-efgh-ijkl-mnop</span>
        <Check className="h-3.5 w-3.5 shrink-0 text-cobalt" />
      </div>
      <MockInputField placeholder="Calendar name" />
    </div>
    <MockButton>Connect</MockButton>
  </div>,
]

const ADDRESS_LABELS = [
  'https://account.apple.com/sign-in',
  'https://account.apple.com/sign-in',
  'https://account.apple.com/sign-in',
  'https://account.apple.com/sign-in',
  'https://account.apple.com/sign-in',
  'https://account.apple.com/sign-in',
  'Syncal',
]

const SLIDES = SETUP_STEPS.map((step, index) => ({
  ...step,
  addressLabel: ADDRESS_LABELS[index],
  illustration: ILLUSTRATIONS[index],
}))

const AUTO_ADVANCE_MS = 4000

export function SetupSlideshow() {
  const { index, goTo, next, prev, containerProps } = useSlideshow(SLIDES.length, AUTO_ADVANCE_MS)
  const slide = SLIDES[index]

  return (
    <div
      className="rounded-md border border-line bg-white p-5 outline-none"
      {...containerProps}
      role="group"
      aria-roledescription="carousel"
      aria-label="Apple app-specific password setup walkthrough"
    >
      <div className="relative h-64">
        {SLIDES.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-300 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <BrowserFrame addressLabel={s.addressLabel}>{s.illustration}</BrowserFrame>
          </div>
        ))}

        <SlideArrowButton direction="left" onClick={prev} />
        <SlideArrowButton direction="right" onClick={next} />
      </div>

      <SlideDots count={SLIDES.length} activeIndex={index} onSelect={goTo} />

      <div className="mt-4 text-center">
        <p className="text-xs font-medium text-cobalt">
          Step {index + 1} of {SLIDES.length}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-ink">{slide.title}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{slide.description}</p>
      </div>
    </div>
  )
}
