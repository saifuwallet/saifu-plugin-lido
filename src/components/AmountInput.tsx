import clsx from 'clsx';

import Button from './Button';
import TokenLogo from './TokenLogo';

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const AmountInput = ({
  className,
  value,
  setValue,
  symbol,
  logoUrl,
  balance,
}: {
  className?: string;
  value?: string;
  setValue: (v: string) => void;
  balance: number;
  symbol: string;
  logoUrl?: string;
}) => {
  return (
    <div className={clsx('p-2', className)}>
      <div className="flex px-2">
        <input
          className="flex-grow block w-full p-2.5 focus:ring-0 border-none bg-transparent font-bold"
          type="text"
          placeholder="0.00"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          pattern="^[0-9]*[.]?[0-9]*$"
          onChange={(e) =>
            inputRegex.test(escapeRegExp(e.target.value)) && setValue(e.target.value)
          }
          value={value}
        />
        <div className="flex flex-none justify-center space-x-2">
          <TokenLogo size="sm" className="m-auto" url={logoUrl} />
          <p className="font-semibold text-lg m-auto text-gray-400">{symbol}</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="inverse"
          size="xs"
          text={`Balance: ${balance.toFixed(2)}`}
          onClick={() => setValue(balance.toString())}
        />
      </div>
    </div>
  );
};

export default AmountInput;
