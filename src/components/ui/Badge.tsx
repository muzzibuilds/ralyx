/**
 * Reusable Badge component
 * Status/tag indicator
 */

import type { BadgeProps } from '../../types';
import './Badge.css';

export default function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`}>
      {children}
    </span>
  );
}
