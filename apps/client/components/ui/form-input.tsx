'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

export interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  disabled,
  className,
}: FormInputProps<T>) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className={cn(error && 'text-destructive')}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        {...register(name)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
