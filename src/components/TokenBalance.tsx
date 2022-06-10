import { Card, Text, TokenLogo } from '@saifuwallet/saifu-ui';
import BN from 'bn.js';
import { useTokenInfos, usePrice, useTokenAccounts } from 'saifu';

import { lamportsToSol, lamportsToUSD } from '@/lib/number';

const TokenBalance = ({ exchangeRate }: { exchangeRate: number }) => {
  const tokenAccounts = useTokenAccounts();
  const tokenInfos = useTokenInfos();

  const stSolInfo = tokenInfos.find((t) => t.symbol === 'stSOL');
  const stSolAccount = tokenAccounts.data?.find((t) => t.mint === stSolInfo?.address);
  const stSolAmount = new BN(stSolAccount?.amount || '0');

  const solInfo = tokenInfos.find((t) => t.symbol === 'SOL');
  const solPrice = usePrice(solInfo);

  return (
    <Card className="flex space-x-2 p-4">
      <div className="flex-none">
        <TokenLogo url={stSolInfo?.logoURI} />
      </div>
      <div className="flex-grow text-left">
        <Text as="p" weight="semibold">
          {stSolInfo?.symbol}
        </Text>
      </div>
      <div className="flex-none text-right">
        <Text as="p" weight="semibold">
          {lamportsToSol(stSolAmount.toNumber())}
        </Text>
        <Text as="p">
          {lamportsToUSD(
            stSolAmount.toNumber(),
            solPrice.data || 1 * exchangeRate,
            stSolInfo?.decimals
          )}
        </Text>
      </div>
    </Card>
  );
};

export default TokenBalance;
