import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { classNames } from '../lib';

interface ButtonProps {
  fullWidth?: boolean;
  severity?: 'primary' | 'secondary' | 'danger';
  size?: 'base' | 'small';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  tittle?: string;

  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  fullWidth,
  severity = 'primary',
  size = 'base',
  onPress,
  disabled,
  className,
  children,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={classNames(
        'inline-flex flex-shrink-0 items-center justify-center rounded-full text-center shadow-sm',
        fullWidth ? 'w-full' : '',
        severity === 'secondary'
          ? 'bg-taza-light disabled:bg-taza-light/50 border-taza-orange border'
          : severity === 'danger'
            ? 'bg-taza-red disabled:bg-taza-red/50'
            : 'bg-taza-orange disabled:bg-taza-orange/50',
        size === 'small' ? 'px-3 py-1.5' : 'px-4 py-3',
        disabled ? 'opacity-50' : '',
        className || ''
      )}
      {...props}>
      <Text
        className={classNames(
          'text-center',
          severity === 'secondary' ? 'text-taza-dark' : 'text-white',
          size === 'small' ? 'text-sm' : 'text-base'
        )}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
