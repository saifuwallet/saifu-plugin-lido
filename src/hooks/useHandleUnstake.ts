import solido from '@chorusone/solido.js';
import { getHeaviestValidatorStakeAccount } from '@chorusone/solido.js/dist/utils';
import {
  StakeProgram,
  Transaction,
  Authorized,
  TransactionInstruction,
  Connection,
  PublicKey,
  Keypair,
} from '@solana/web3.js';
import { useConnection, useMutation, usePublicKey, useSignAllTransactions } from 'saifu';

import addresses from '@/lib/addresses';
import { findAssociatedTokenAddress } from '@/lib/ata';
import { solToLamports } from '@/lib/number';

import useValidatorStakeData from './useValidatorStakeData';

const useHandleUnstake = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();
  const validatorStakeData = useValidatorStakeData();

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
    const insts: TransactionInstruction[] = [];

    const stakeCreateAccInst = StakeProgram.createAccount({
      authorized: new Authorized(pk, pk), // Here we set two authorities: Stake Authority and Withdrawal Authority. Both are set to our wallet.
      fromPubkey: pk,
      // lamports: snapshot.stakeAccountRentExemptionBalance.lamports.toNumber(), // set the account as rent exempt
      lamports: 0, // set the account as rent exempt
      stakePubkey: lidoStakeAccount.publicKey,
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
    // tx.add(withdrawInstruction);
    tx.add(...stakeCreateAccInst.instructions);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = pk;
    tx.sign(lidoStakeAccount);


    signAllTxs([tx]);
  });
};

export default useHandleUnstake;
