import { StakeProgram } from '@solana/web3.js';
import { useConnection, usePublicKey, useQuery } from 'saifu';

import { StakeData } from '@/components/StakedRow';
import ParsedStakeAccount from '@/lib/parsedstakeaccount';

const useValidatorStakeData = () => {
  const connection = useConnection();
  const pk = usePublicKey();

  return useQuery(['validator-stakes', pk], async () => {
    if (pk) {
      const res = await connection.getParsedProgramAccounts(StakeProgram.programId, {
        filters: [
          { dataSize: 200 },
          {
            memcmp: {
              offset: 4 + 8 + 32, // offset for withdrawer
              bytes: pk.toString(),
            },
          },
        ],
      });

      if (res.length === 0) {
        return;
      }

      const promises: Promise<StakeData | null>[] = res.map((acc) => {
        const parsedData = (acc.account.data as any).parsed as ParsedStakeAccount;

        return new Promise<StakeData>((resolve, reject) => {
          (async () => {
            const voter = parsedData.info.stake?.delegation.voter || '';
            const balance = await connection.getBalance(acc.pubkey);

            connection
              .getStakeActivation(acc.pubkey)
              .then((stakeActivationData) => {
                resolve({
                  balance,
                  voter,
                  stakeActivationData,
                  stakeAccount: acc.pubkey,
                });
              })
              .catch(reject);
          })();
        });
      });

      return (await Promise.all(promises))
        .filter((x) => !!x)
        .sort((a, b) => (b?.balance ?? 0) - (a?.balance ?? 0)) as StakeData[];
    }
  });
};

export default useValidatorStakeData;
