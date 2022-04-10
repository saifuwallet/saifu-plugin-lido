import { useEffect } from 'react';
import { useQuery } from 'saifu';

const statsUrl = 'https://solana.lido.fi/api/stats';

interface LidoStats {
  apr: number;
  numberOfStSolAccountsEmpty: number;
  numberOfStSolAccountsTotal: number;
  solPriceInUsd: number;
  stakers: number;

  totalRewards: {
    sol: number;
    usd: number;
  };

  totalStaked: {
    sol: number;
    usd: number;
  };
}

const useLidoStats = () => {
  return useQuery('lido-stats', async () => {
    return (await (await fetch(statsUrl)).json()) as LidoStats;
  });
};

export default useLidoStats;
