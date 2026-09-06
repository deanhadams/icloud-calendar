import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'destructive'
type Size = 'md' | 'sm'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-cobalt text-white hover:bg-cobalt-hover',
  secondary: 'border border-line text-ink hover:border-ink/30 hover:bg-ink/5',
  destructive: 'border border-line text-ink hover:border-red-400 hover:text-red-600',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  )
}
