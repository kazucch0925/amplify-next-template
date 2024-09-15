// app/components/Button.tsx

import React from 'react';
import './Button.css';

export default function Button({
    onClick,
    children,
    className,
    iconSrc,
    altText,
    colorScheme = 'primary',
    variant = 'solid',
    disabled
}: {
    onClick?: () => void;
    children?: string;
    className?: string;
    iconSrc?: string;
    altText?: string;
    colorScheme?: string;
    variant?: string;
    disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`custom-button ${className} ${colorScheme} ${variant}`}
      disabled={disabled}
    >
      {iconSrc && <img src={iconSrc} alt={altText} className="button-icon" />}
      {children}
    </button>
    );
}