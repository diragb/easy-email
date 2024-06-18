import * as React from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// import { cn } from '../../lib/utils';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div className='flex flex-col'>
        {label && <label className='mb-1 text-sm text-gray-700'>{label}</label>}
        <div
          className={cn(
            'flex items-center h-8 w-full rounded-md border border-input bg-[#F8FAFC] text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden',
            className
          )}>
          {startAdornment && <span className='pl-2 rounded-l-md overflow-hidden'>{startAdornment}</span>}
          <input
            type={type}
            className={cn(
              'flex h-8 w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && <span className='pr-2 rounded-r-md overflow-hidden'>{endAdornment}</span>}
        </div>
        {helperText && <span className='mt-1 text-xs text-muted-foreground'>{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
