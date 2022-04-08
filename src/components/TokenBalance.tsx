import BN from 'bn.js';
import { useTokenInfos, usePrice, useTokenAccounts } from 'saifu';

import { lamportsToSol, lamportsToUSD } from '@/lib/number';

import Card from './Card';
import TokenLogo from './TokenLogo';

const TokenBalance = () => {
  const tokenInfos = useTokenInfos();
  const tokenInfo = tokenInfos.find((t) => t.symbol === 'stSOL');
  const tokenAccounts = useTokenAccounts();
  const stSolAccount = tokenAccounts.data?.find((t) => t.mint === tokenInfo?.address);
  const stSolAmount = new BN(stSolAccount?.amount || '0');

  const price = usePrice(tokenInfo);

  return (
    <Card className="flex space-x-2">
      <div className="flex-none">
        <TokenLogo url={tokenInfo?.logoURI} alt="stSOL Logo" />
      </div>
      <div className="flex-grow text-left">
        <p className="font-bold">{tokenInfo?.symbol} </p>
        <p>-</p>
      </div>
      <div className="flex-none text-right">
        <p className="font-bold">{lamportsToSol(stSolAmount.toNumber())}</p>
        <p className="">
          {lamportsToUSD(stSolAmount.toNumber(), price.data || 0, tokenInfo?.decimals)}
        </p>
      </div>
    </Card>
  );
};

export default TokenBalance;
