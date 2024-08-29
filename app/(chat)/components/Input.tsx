import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { classNames } from '../lib';

interface InputProps extends TextInputProps {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <TextInput
      {...props}
      className={classNames(
        'border-taza-orange text-taza-dark w-full rounded-xl border bg-white px-5 py-4',
        'placeholder:text-taza-dark/50',
        className || ''
      )}
      placeholderTextColor="rgba(0, 0, 0, 0.5)" // Assuming taza-dark is close to black
    />
  );
};

export default Input;
