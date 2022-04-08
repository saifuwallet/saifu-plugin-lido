import clsx from 'clsx';

import Spinner from './Spinner';

const variants = {
  primary: 'bg-white/70 border border-white/40',
  highlight: 'bg-gradient-to-br from-pink-500 to-orange-400 text-white border border-white/40',
};

const sizes = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

const shadows = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export type CardProps = {
  isLoading?: boolean;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  shadow?: keyof typeof shadows;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

const Card = ({
  className = '',
  isLoading = false,
  variant = 'primary',
  size = 'md',
  shadow = 'md',
  onClick,
  children,
}: CardProps) => {
  return (
    <div
      className={clsx(
        'w-full rounded-md shadow-md',
        variants[variant],
        sizes[size],
        shadows[shadow],
        className,
        onClick && 'cursor-pointer transition ease-in-out duration-200',
        onClick && variant === 'primary' && 'hover:bg-white/90'
      )}
    >
      {isLoading && <Spinner />}
      {children}
    </div>
  );
};

export default Card;
