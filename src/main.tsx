import solido, { getExchangeRate } from '@chorusone/solido.js';
import { Tab } from '@headlessui/react';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import { FunctionComponent, useState } from 'react';
import {
  Plugin,
  useConnection,
  useMutation,
  usePublicKey,
  useQuery,
  useSignAllTransactions,
  useTokenAccounts,
  ViewProps,
} from 'saifu';

import useHandleWithdraw from '@/hooks/useHandleWithdraw';
import useStsolExchangeRate from '@/hooks/useStsolExchangeRate';
import useValidatorStakeData from '@/hooks/useValidatorStakeData';

import Button from './components/Button';
import { LidoIcon, LidoIconText } from './components/Icon';
import SolanaLogo from './components/SolanaLogo';
import Spinner from './components/Spinner';
import StakedRow, { StakeData } from './components/StakedRow';
import TokenBalance from './components/TokenBalance';
import useLidoStats from './hooks/useLidoStats';
import { findAssociatedTokenAddress } from './lib/ata';
import { lamportsToSol, solToLamports } from './lib/number';
import ParsedStakeAccount from './lib/parsedstakeaccount';
import './style.css';

const Lido: FunctionComponent<ViewProps> = () => {
  const connection = useConnection();
  const pk = usePublicKey();
  const signAllTxs = useSignAllTransactions();

  const [enteredAmount, setEnteredAmount] = useState<number>();

  const stakeData = useValidatorStakeData();
  const exchangeRate = useStsolExchangeRate();
  const lidoStats = useLidoStats();
  const tokenAccounts = useTokenAccounts();

  const solAccount = tokenAccounts.data?.find((t) => t.isSol);
  const solBalance = new BN(solAccount?.amount || '0');

  let willReceive = 0;
  if (enteredAmount && enteredAmount !== 0 && exchangeRate.data) {
    willReceive = enteredAmount / exchangeRate.data;
  }

  const handleStake = useMutation(async () => {
    if (!pk) {
      return;
    }

    if (!enteredAmount) {
      return;
    }

    const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);
    const stakeAmount = new solido.Lamports(solToLamports(enteredAmount));

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

    signAllTxs([tx]);
  });

  const handleWithdraw = useHandleWithdraw();
  const tabs = ['Stake', 'Unstake'];

  return (
    <div>
      <div className="w-full bg-white rounded-md">
        <div className="space-y-4 p-6">
          <div className="m-auto block text-center mb-2">
            <LidoIcon className="w-6 h-6 inline-block" variant="original" />
            <LidoIconText className="inline-block" />
          </div>
          <div className="space-y-2">
            <Tab.Group>
              <Tab.List className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
                {tabs.map((tabName) => (
                  <Tab
                    key={tabName}
                    className={({ selected }) =>
                      clsx(
                        'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg',
                        'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                        selected
                          ? 'bg-white shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      )
                    }
                  >
                    {tabName}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                {tabs.map((tabName) => (
                  <Tab.Panel key={tabName}>
                    <SolanaLogo />
                    <input
                      className="w-full border-r border-[#d1d8df] focus:border-[#00a3ff] placeholder:text-[#d1d8df] rounded-xl px-12 py-4 text-sm"
                      placeholder="Amount"
                      type="number"
                      step="0.01"
                      onChange={(e) => {
                        let amount = parseFloat(e.target.value);
                        const solBalanceSol = lamportsToSol(solBalance.toNumber());
                        if (amount > solBalanceSol) {
                          amount = solBalanceSol;
                        }

                        setEnteredAmount(amount);
                      }}
                      value={enteredAmount}
                    />
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
          <div className="">
            <Button
              onClick={() => handleStake.mutateAsync()}
              isLoading={handleStake.isLoading || exchangeRate.isLoading}
              disabled={handleStake.isLoading || !pk || !enteredAmount || exchangeRate.isLoading}
              className="w-full my-8"
              text="Stake SOL"
            ></Button>
          </div>
          <div className="grid grid-cols-2 gap-4 relative">
            <p>Available SOL:</p>
            <p className="text-right">{lamportsToSol(solBalance.toNumber()).toFixed(4)} SOL</p>

            <p>You will receive:</p>
            <p className="text-right">~ {willReceive.toFixed(4)} stSOL</p>

            <p>Exchange Rate:</p>
            <p className="text-right">1 stSOL = ~{exchangeRate.data?.toFixed(4)} SOL</p>

            <p>Transaction Cost</p>
            <p className="text-right">~ 0.000005 SOL</p>

            <p>Lido staking rewards fee</p>
            <p className="text-right">10%</p>

            <p>Lido Staking APR</p>
            <p className="text-right">
              {lidoStats.data?.apr.toFixed(2).concat('%') || (
                <Spinner className="absolute right-0" />
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-bold my-2">Staking overview</h2>
        <p className="p-4 bg-[#00a3ff10] text-[#00a3ff]">
          SOL becomes withdrawable after it has finished deactivating which will take 2~3 days upon
          unstaking.{' '}
          <a
            className="text-[#00a3ff] underline"
            href="https://docs.solana.lido.fi/staking/phantom/#step-6-unstaking-and-utlizing-stsol"
            target="_blank"
            rel="noreferrer"
          >
            More info here
          </a>
        </p>

        <div className="space-y-2">
          <TokenBalance exchangeRate={exchangeRate.data || 0} />

          {((stakeData.isLoading || !stakeData.isSuccess) && (
            <div>
              <Spinner className="inline-block" />
              <p className="inline-block">Searching staking accounts</p>
            </div>
          )) ||
            stakeData.data?.map((row) => (
              <StakedRow
                key={row.voter}
                data={row}
                isLoading={handleWithdraw.isLoading}
                onWithdraw={() =>
                  handleWithdraw.mutateAsync({
                    stakeAccount: row.stakeAccount,
                    stakeBalance: row.balance,
                  })
                }
              />
            ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold my-2">Lido statistics</h2>
        <div className="w-full bg-white rounded-md ">
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4 relative">
              <p>Total staked with Lido:</p>
              <p className="text-right">
                {lidoStats.data?.totalStaked.sol.toFixed(4).concat(' SOL') || (
                  <Spinner className="absolute right-0" />
                )}
              </p>
              <p>Stakers:</p>

              <p className="text-right">
                {lidoStats.data?.stakers.toFixed(0).concat(' Stakers') || (
                  <Spinner className="absolute right-0" />
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class LidoPlugin extends Plugin {
  id = 'lido';

  async onload(): Promise<void> {
    this.addView({
      title: 'Stake',
      id: 'lido',
      component: Lido,
      icon: <LidoIcon variant="white" className="h-5 w-5 ml-[3px]" />,
    });
  }
}

export default LidoPlugin;
