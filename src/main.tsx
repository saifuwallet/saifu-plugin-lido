import solido, { getExchangeRate, getStSolSupply } from '@chorusone/solido.js';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
// eslint-disable-next-line import/no-unresolved
import { FunctionComponent, useEffect, useState } from 'react';
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

import Button from './components/Button';
import { LidoIcon, LidoIconText } from './components/Icon';
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

  const lamportsPerSol = new BN(LAMPORTS_PER_SOL);

  const [enteredAmount, setEnteredAmount] = useState<number>();

  const [tvl, setTvl] = useState(new BN(0));
  const [exchangeRate, setExchangeRate] = useState(0);
  const [stSolSupply, setStSolSupply] = useState(new BN(0));

  const lidoStats = useLidoStats();

  const tokenAccounts = useTokenAccounts();
  const solAccount = tokenAccounts.data?.find((t) => t.isSol);
  const solBalance = new BN(solAccount?.amount || '0');

  const stakeData = useQuery(['validator-stakes', pk], async () => {
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

      const promises = res.map((acc) => {
        const parsedData = (acc.account.data as any).parsed as ParsedStakeAccount;

        const voter = parsedData.info.stake.delegation.voter;
        return new Promise<StakeData>((resolve, reject) => {
          connection
            .getStakeActivation(acc.pubkey)
            .then((stakeActivationData) => {
              resolve({
                voter,
                stakeActivationData,
                stakeAccount: acc.pubkey,
              });
            })
            .catch(reject);
        });
      });

      return await Promise.all(promises);
    }
  });

  let willReceive = 0;
  if (enteredAmount && enteredAmount !== 0 && exchangeRate !== 0) {
    willReceive = enteredAmount / exchangeRate;
  }

  useEffect(() => {
    (async () => {
      const snapshot = await solido.getSnapshot(connection, solido.MAINNET_PROGRAM_ADDRESSES);

      const stSolSupply = getStSolSupply(snapshot, 'totalcoins');
      const exchangeRate = getExchangeRate(snapshot);
      const tvl = solido.getTotalValueLocked(snapshot);

      setTvl(tvl.lamports);
      setExchangeRate(exchangeRate);
      setStSolSupply(stSolSupply.stLamports);
    })();
  }, []);

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

  const handleWithdraw = useMutation(
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

  return (
    <div>
      <div className="w-full bg-white rounded-md">
        <div className="space-y-4 p-6">
          <div className="m-auto block text-center mb-2">
            <LidoIcon className="w-6 h-6 inline-block" variant="original" />
            <LidoIconText className="inline-block" />
          </div>

          <div className="relative">
            <svg
              className="absolute top-1/2 transform -translate-y-1/2 left-4"
              width="24"
              height="24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="12" fill="#000"></rect>
              <path
                d="M17.129 9.033a.442.442 0 01-.314.132H5.695c-.393 0-.592-.48-.318-.764l1.824-1.89a.441.441 0 01.318-.136H18.68c.396 0 .594.485.314.768l-1.865 1.89zm0 8.44a.447.447 0 01-.314.129H5.695a.438.438 0 01-.318-.745l1.824-1.843a.447.447 0 01.318-.132H18.68c.396 0 .594.472.314.748l-1.865 1.843zm0-6.716a.447.447 0 00-.314-.128H5.695a.438.438 0 00-.318.745l1.824 1.842a.446.446 0 00.318.132H18.68a.438.438 0 00.314-.748l-1.865-1.843z"
                fill="url(#solana-round_svg__paint0_linear)"
              ></path>
              <defs>
                <linearGradient
                  id="solana-round_svg__paint0_linear"
                  x1="6.263"
                  y1="17.906"
                  x2="18.092"
                  y2="6.077"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#CF41E8"></stop>
                  <stop offset="1" stopColor="#10F2B0"></stop>
                </linearGradient>
              </defs>
            </svg>
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
          </div>
          <div className="">
            <Button
              onClick={() => handleStake.mutateAsync()}
              isLoading={handleStake.isLoading}
              disabled={handleStake.isLoading}
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
            <p className="text-right">1 stSOL = ~{exchangeRate.toFixed(4)} SOL</p>

            <p>Transaction Cost</p>
            <p className="text-right">~ 0.000005 SOL</p>

            <p>Lido staking rewards fee</p>
            <p className="text-right">10%</p>

            <p>Staking APR</p>
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
          <TokenBalance />

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
                    stakeBalance: row.stakeActivationData.inactive,
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
      title: 'Lido',
      id: 'lido',
      component: Lido,
      icon: <LidoIcon variant="white" className="h-5 w-5 ml-[3px]" />,
    });
  }
}

export default LidoPlugin;
