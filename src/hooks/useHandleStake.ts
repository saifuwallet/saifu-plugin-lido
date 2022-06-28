import solido from '@chorusone/solido.js';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { useConnection, useMutation, usePublicKey, useSignAllTransactions } from 'saifu';

import { findAssociatedTokenAddress } from '@/lib/ata';
import { solToLamports } from '@/lib/number';

export const generateStakeTransaction = async (
  pk: PublicKey | undefined,
  amount: string,
  connection: Connection
) => {
  console.log('gen -- ', pk, amount);
  if (!pk) {
    return;
  }

  if (!amount) {
    return;
  }

  const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);
  const stakeAmount = new solido.Lamports(amount);

  const ata = await findAssociatedTokenAddress(pk, snapshot.programAddresses.stSolMintAddress);

  // try to get ata
  const insts: TransactionInstruction[] = [];

  // add instruction to create ATA if doesn't exist yet
  try {
    connection.getAccountInfo(ata);
  } catch (e) {
    const ataInitInst = await solido.getATAInitializeInstruction(
      snapshot.programAddresses.stSolMintAddress,
      pk
    );

    insts.push(ataInitInst);
  }

  // actual deposit instruction
  const depositInstruction = await solido.getDepositInstruction(
    pk,
    ata,
    solido.MAINNET_PROGRAM_ADDRESSES,
    stakeAmount
  );

  insts.push(depositInstruction);

  const tx = new Transaction();
  tx.add(...insts);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = pk;

  return tx;
};

const useHandleStake = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();

  return useMutation(async ({ enteredAmount }: { enteredAmount: number }) => {
    const amount = solToLamports(enteredAmount);
    const tx = await generateStakeTransaction(pk, amount.toString(), connection);
    if (!tx) {
      return;
    }

    signAllTxs([tx]);
  });
};

export default useHandleStake;
