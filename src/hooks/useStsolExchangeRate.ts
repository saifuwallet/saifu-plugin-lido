import solido, { getExchangeRate } from '@chorusone/solido.js';
import { useConnection, useQuery } from 'saifu';

const useStsolExchangeRate = () => {
  const connection = useConnection();

  return useQuery(
    ['exchange-rate'],
    async () => {
      const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);

      return getExchangeRate(snapshot);
    },
    {
      placeholderData: 0,
    }
  );
};

export default useStsolExchangeRate;
