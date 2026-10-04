/**
 * Reusable Card component
 * Container for grouped content
 */

import type { CardProps } from '../../types';
import './Card.css';

export default function Card({ variant = 'default', children, className = '' }: CardProps) {
  return (
    <div className={`card card--${variant} ${className}`}>
      {children}
    </div>
  );
}
