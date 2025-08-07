import React from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'default',
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          className
        )}
      />
      {label && (
        <label className={cn(
          "text-sm font-medium text-foreground cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          {label}
        </label>
      )}
    </div>
  );
};

export { Checkbox };