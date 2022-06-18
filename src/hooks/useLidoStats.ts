import { useQuery } from 'saifu';

const statsUrl = 'https://solana.lido.fi/api/stats';

export interface LidoStats {
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

export const fetchLidoStats = async () => {
  return (await (await fetch(statsUrl)).json()) as LidoStats;
};

const useLidoStats = () => {
  return useQuery('lido-stats', fetchLidoStats);
};

export default useLidoStats;
