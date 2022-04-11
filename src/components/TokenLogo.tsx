import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

export type TokenLogoProps = {
  url?: string;
  alt?: string;
  size?: keyof typeof sizes;
  shape?: keyof typeof shapes;
  className?: string;
};

const shapes = {
  round: 'rounded-full',
  square: 'rounded',
};

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-24 w-24',
};

const TokenLogo = ({ className, url, alt, size = 'md', shape = 'round' }: TokenLogoProps) => {
  return (
    <>
      {url ? (
        <img
          loading="lazy"
          className={clsx('shadow-lg', sizes[size], shapes[shape], className)}
          src={url}
          alt={alt}
        />
      ) : (
        <QuestionMarkCircleIcon className={clsx('text-gray-400', sizes[size], className)} />
      )}
    </>
  );
};

export default TokenLogo;
