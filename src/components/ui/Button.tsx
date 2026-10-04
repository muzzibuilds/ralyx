/**
 * Reusable Button component
 * Supports multiple variants and sizes
 */

import type { ButtonProps } from '../../types';
import './Button.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn--${variant} btn--${size} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
