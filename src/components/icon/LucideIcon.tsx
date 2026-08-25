import { forwardRef, memo } from 'react'
import { icons, type LucideProps } from 'lucide-react'

/** Valid Lucide icon names (PascalCase keys from `lucide-react`). */
export type LucideIconName = keyof typeof icons

export interface LucideIconProps extends LucideProps {
  /** Icon name, e.g. `"Download"`, `"Trash2"`, `"FlipHorizontal2"`. */
  icon: LucideIconName
  /** Accessible label; when set, icon is not `aria-hidden`. */
  label?: string
}

/**
 * Typed wrapper around Lucide icons.
 * Prefer this over importing icons directly from `lucide-react`.
 *
 * @example
 * <LucideIconComponent icon="Download" size={16} className="text-white" />
 */
export const LucideIconComponent = memo(
  forwardRef<SVGSVGElement, LucideIconProps>(function LucideIconComponent(
    { icon, label, 'aria-hidden': ariaHidden, ...props },
    ref
  ) {
    const Icon = icons[icon]

    if (!Icon) {
      if (import.meta.env.DEV) {
        console.warn(`[LucideIconComponent] Unknown icon: "${String(icon)}"`)
      }
      return null
    }

    return (
      <Icon
        ref={ref}
        aria-hidden={label ? undefined : (ariaHidden ?? true)}
        aria-label={label}
        role={label ? 'img' : undefined}
        {...props}
      />
    )
  })
)

LucideIconComponent.displayName = 'LucideIconComponent'

export default LucideIconComponent
