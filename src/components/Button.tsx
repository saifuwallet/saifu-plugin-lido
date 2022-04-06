import clsx from 'clsx';
import * as React from 'react';

import Spinner from './Spinner';

const variants = {
  primary: 'bg-gradient-to-br from-pink-500 to-orange-400 text-white',
  inverse: 'text-gray-500 hover:text-orange-500',
  danger: 'bg-red-600 text-white hover:bg-red-50 hover:bg-red-700',
};

const sizes = {
  xs: 'py-1 px-2 text-xs',
  sm: 'py-2 px-4 text-sm',
  md: 'py-2 px-4 text-md font-medium',
  lg: 'py-2 px-4 text-lg font-semibold',
};

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined };

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  text: string;
} & IconProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          'flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed rounded-md focus:outline-none space-x-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Spinner variant="white" className="text-lg mr-2" />}
        {!isLoading && startIcon}
        <p>{props.text}</p>
        {!isLoading && endIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default React.memo(Button);
