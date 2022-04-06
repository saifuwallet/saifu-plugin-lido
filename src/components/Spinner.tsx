import clsx from 'clsx';
import React from 'react';
import { CgSpinnerAlt } from 'react-icons/cg';

const sizes = {
  xs: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};
const variants = {
  white: 'text-white',
  gray: 'text-gray-400',
};

const Spinner = ({
  className,
  size = 'md',
  variant = 'gray',
}: {
  className?: string;
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
}) => {
  return (
    <CgSpinnerAlt className={clsx('animate-spin', className, sizes[size], variants[variant])} />
  );
};

export default React.memo(Spinner);
