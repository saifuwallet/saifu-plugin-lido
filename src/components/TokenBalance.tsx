import BN from 'bn.js';
import { useTokenInfos, usePrice, useTokenAccounts } from 'saifu';

import { lamportsToSol, lamportsToUSD } from '@/lib/number';

import Card from './Card';
import TokenLogo from './TokenLogo';

const TokenBalance = ({ exchangeRate }: { exchangeRate: number }) => {
  const tokenAccounts = useTokenAccounts();
  const tokenInfos = useTokenInfos();

  const stSolInfo = tokenInfos.find((t) => t.symbol === 'stSOL');
  const stSolAccount = tokenAccounts.data?.find((t) => t.mint === stSolInfo?.address);
  const stSolAmount = new BN(stSolAccount?.amount || '0');

  const solInfo = tokenInfos.find((t) => t.symbol === 'SOL');
  const solPrice = usePrice(solInfo);

  const price = solPrice.data || 1 * exchangeRate;

  return (
    <Card className="flex space-x-2">
      <div className="flex-none">
        <TokenLogo url={stSolInfo?.logoURI} alt="stSOL Logo" />
      </div>
      <div className="flex-grow text-left">
        <p className="font-bold">{stSolInfo?.symbol} </p>
        <p>-</p>
      </div>
      <div className="flex-none text-right">
        <p className="font-bold">{lamportsToSol(stSolAmount.toNumber())}</p>
        <p className="">{lamportsToUSD(stSolAmount.toNumber(), price || 0, stSolInfo?.decimals)}</p>
      </div>
    </Card>
  );
};

export default TokenBalance;
