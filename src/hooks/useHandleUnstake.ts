import solido from '@chorusone/solido.js';
import {
  Keypair,
  StakeProgram,
  Transaction,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { useConnection, useMutation, usePublicKey, useSignAllTransactions } from 'saifu';

import { findAssociatedTokenAddress } from '@/lib/ata';
import { solToLamports } from '@/lib/number';

export const generateUnstakeTransaction = async (
  pk: PublicKey | undefined,
  amount: number,
  connection: Connection
) => {
  if (!pk) {
    return;
  }

  if (!amount) {
    return;
  }

  const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);
  const unstakeAmount = new solido.StLamports(amount);

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

  return tx;
};

const useHandleUnstake = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();

  return useMutation(async ({ enteredAmount }: { enteredAmount: number }) => {
    const amount = solToLamports(enteredAmount);
    const tx = await generateUnstakeTransaction(pk, amount, connection);

    if (!tx) {
      return;
    }

    signAllTxs([tx]);
  });
};

export default useHandleUnstake;
