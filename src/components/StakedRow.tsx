import { PublicKey, StakeActivationData } from '@solana/web3.js';
import { useTokenInfos } from 'saifu';

import { lamportsToSol } from '@/lib/number';

import Button from './Button';
import Card from './Card';
import TokenLogo from './TokenLogo';

export interface StakeData {
  voter: string;
  stakeActivationData: StakeActivationData;
  stakeAccount: PublicKey;
}

const StakedRow = ({
  data,
  onWithdraw,
  isLoading,
}: {
  data: StakeData;
  onWithdraw: () => void;
  isLoading: boolean;
}) => {
  const tokenInfos = useTokenInfos();
  const tokenInfo = tokenInfos.find((t) => t.symbol === 'SOL');

  const isWithdrawable = data.stakeActivationData.state === 'inactive';

  return (
    <Card className="flex space-x-2">
      <div className="flex-none">
        <TokenLogo url={tokenInfo?.logoURI} alt="Solana Logo" />
      </div>
      <div className="flex-grow text-left">
        <p className="font-bold">{tokenInfo?.symbol} </p>
        <p>{lamportsToSol(data.stakeActivationData.inactive)} SOL</p>
      </div>
      <div className="flex-none text-right">
        <p className="font-bold">{data.stakeActivationData.state}</p>
        <p className="">
          <Button
            isLoading={isLoading}
            onClick={onWithdraw}
            disabled={!isWithdrawable || isLoading}
            text="Withdraw"
          />
        </p>
      </div>
    </Card>
  );
};

export default StakedRow;
