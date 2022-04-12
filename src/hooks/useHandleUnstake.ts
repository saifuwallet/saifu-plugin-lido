import solido from '@chorusone/solido.js';
import { Keypair, StakeProgram, Transaction } from '@solana/web3.js';
import { useConnection, useMutation, usePublicKey, useSignAllTransactions } from 'saifu';

import { findAssociatedTokenAddress } from '@/lib/ata';
import { solToLamports } from '@/lib/number';

const useHandleUnstake = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();

  return useMutation(async ({ enteredAmount }: { enteredAmount: number }) => {
    if (!pk) {
      return;
    }

    if (!enteredAmount) {
      return;
    }

    const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);
    const unstakeAmount = new solido.StLamports(solToLamports(enteredAmount));

    const ata = await findAssociatedTokenAddress(pk, snapshot.programAddresses.stSolMintAddress);

    // create new account to be used as stakingaccount
    const lidoStakeAccount = Keypair.generate();
    const deactivateTx = StakeProgram.deactivate({
      stakePubkey: lidoStakeAccount.publicKey,
      authorizedPubkey: pk,
    });

    // actual deposit instruction
    const withdrawInstruction = await solido.getWithdrawInstruction(
      snapshot,
      pk,
      ata,
      lidoStakeAccount.publicKey,
      unstakeAmount
    );

    const tx = new Transaction();
    tx.add(withdrawInstruction);
    tx.add(...deactivateTx.instructions);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = pk;
    tx.partialSign(lidoStakeAccount);

    signAllTxs([tx]);
  });
};

export default useHandleUnstake;
