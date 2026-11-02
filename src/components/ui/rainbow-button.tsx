import { type ButtonHTMLAttributes, forwardRef } from "react"

type RainbowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className = "", children, ...props }, ref) => (
    <button ref={ref} className={`blue-orbit-button ${className}`} {...props}>
      <span>{children}</span>
    </button>
  )
)

RainbowButton.displayName = "RainbowButton"

export { RainbowButton, type RainbowButtonProps }
