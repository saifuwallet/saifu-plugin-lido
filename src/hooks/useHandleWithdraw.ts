import { PublicKey, StakeProgram } from '@solana/web3.js';
// eslint-disable-next-line import/no-unresolved
import { useConnection, useMutation, usePublicKey, useSignAllTransactions } from 'saifu';

const useHandleWithdraw = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();

  return useMutation(
    async ({ stakeAccount, stakeBalance }: { stakeAccount: PublicKey; stakeBalance: number }) => {
      if (!pk) {
        return;
      }

      const withdrawTx = StakeProgram.withdraw({
        stakePubkey: stakeAccount,
        authorizedPubkey: pk,
        toPubkey: pk,
        lamports: stakeBalance, // Withdraw the full balance at the time of the transaction
      });
      withdrawTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      withdrawTx.feePayer = pk;

      signAllTxs([withdrawTx]);
    }
  );
};

export default useHandleWithdraw;
