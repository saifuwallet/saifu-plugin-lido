import { Button, Card, Text, TokenLogo } from '@saifuwallet/saifu-ui';
import { PublicKey, StakeActivationData } from '@solana/web3.js';
import { useTokenInfos } from 'saifu';

import { lamportsToSol } from '@/lib/number';

export interface StakeData {
  voter: string;
  balance: number;
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
    <Card className="flex space-x-2 p-2">
      <div className="flex-none">
        <TokenLogo url={tokenInfo?.logoURI} />
      </div>
      <div className="flex-grow text-left">
        <Text as="p" className="font-bold">
          {tokenInfo?.symbol}
        </Text>
        <Text as="p">{lamportsToSol(data.balance)} SOL</Text>
      </div>
      <div className="flex-none text-right">
        <Text as="p" weight="bold">
          {data.stakeActivationData.state}
        </Text>
        <Button isLoading={isLoading} onClick={onWithdraw} disabled={!isWithdrawable || isLoading}>
          Withdraw
        </Button>
      </div>
    </Card>
  );
};

export default StakedRow;
