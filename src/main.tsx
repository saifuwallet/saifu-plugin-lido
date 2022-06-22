import { Tab } from '@headlessui/react';
import { AmountInput, Button, Card, Spinner, Text } from '@saifuwallet/saifu-ui';
import BN from 'bn.js';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import { useMemo, useState } from 'react';
import {
  AppContext,
  EarnProvider,
  Opportunity,
  Plugin,
  useParams,
  usePublicKey,
  useTokenAccounts,
  useTokenInfos,
} from 'saifu';

import useHandleWithdraw from '@/hooks/useHandleWithdraw';
import useStsolExchangeRate from '@/hooks/useStsolExchangeRate';
import useValidatorStakeData from '@/hooks/useValidatorStakeData';

import { LidoIcon, LidoIconText } from './components/Icon';
import StakedRow from './components/StakedRow';
import TokenBalance from './components/TokenBalance';
import useHandleStake, { generateStakeTransaction } from './hooks/useHandleStake';
import useHandleUnstake, { generateUnstakeTransaction } from './hooks/useHandleUnstake';
import useLidoStats, { fetchLidoStats, LidoStats } from './hooks/useLidoStats';
import { lamportsToSol } from './lib/number';
import './style.css';

const stSolMint = '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj';

const actionToTabindex = (action: string | null) => {
  if (!action || action === 'stake') {
    return 0;
  }
  return 1;
};

const Lido = () => {
  const pk = usePublicKey();
  const params = useParams();

  const [enteredSolAmount, setEnteredSolAmount] = useState<string>();
  const [enteredStSolAmount, setEnteredStSolAmount] = useState<string>();

  const [unstakeError, setUnstakeError] = useState<string>();
  const [stakeError, setStakeError] = useState<string>();
  const [selectedIndex, setSelectedIndex] = useState(actionToTabindex(params.get('action')));

  const stakeData = useValidatorStakeData();
  const exchangeRate = useStsolExchangeRate();
  const lidoStats = useLidoStats();
  const tokenAccounts = useTokenAccounts();

  const tokenInfos = useTokenInfos();
  const stSolInfo = useMemo(() => tokenInfos.find((t) => t.symbol === 'stSOL'), [tokenInfos]);
  const solInfo = useMemo(() => tokenInfos.find((t) => t.address === 'sol'), [tokenInfos]);

  const solBalance = useMemo(() => {
    const solAccount = tokenAccounts.data?.find((t) => t.isSol);
    return new BN(solAccount?.amount || '0');
  }, [tokenAccounts.data]);

  const stSolBalance = useMemo(() => {
    const stSolAccount = tokenAccounts.data?.find((t) => stSolInfo?.address === t.mint);
    return new BN(stSolAccount?.amount || '0');
  }, [tokenAccounts.data, stSolInfo]);

  const willReceive = useMemo(() => {
    if (enteredSolAmount && Number(enteredSolAmount) !== 0 && exchangeRate.data) {
      return Number(enteredSolAmount) / exchangeRate.data;
    }
    return 0;
  }, [enteredSolAmount, exchangeRate.data]);

  const insufficientSol = useMemo(() => {
    return Number(enteredSolAmount) > lamportsToSol(solBalance.toNumber());
  }, [enteredSolAmount, solBalance]);

  const insufficientStSol = useMemo(() => {
    return Number(enteredStSolAmount) > lamportsToSol(stSolBalance.toNumber());
  }, [enteredStSolAmount, solBalance]);

  const handleStake = useHandleStake();
  const handleUnstake = useHandleUnstake();
  const handleWithdraw = useHandleWithdraw();
  const tabs = ['Stake', 'Unstake'];

  return (
    <div>
      <Card className="w-full">
        <div className="space-y-4 p-6">
          <div className="m-auto block text-center mb-2">
            <LidoIcon className="w-6 h-6 inline-block" />
            <LidoIconText className="inline-block" />
          </div>
          <div className="space-y-4">
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
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
                <Tab.Panel className="space-y-2" key="Stake">
                  <AmountInput
                    setAmount={setEnteredSolAmount}
                    symbol="SOL"
                    logoURI={solInfo?.logoURI}
                    amount={enteredSolAmount}
                    max={lamportsToSol(solBalance.toNumber()).toString()}
                  />

                  <Button
                    onClick={() =>
                      enteredSolAmount &&
                      handleStake
                        .mutateAsync({ enteredAmount: parseFloat(enteredSolAmount) })
                        .catch((e) => setStakeError((e as Error).toString()))
                    }
                    isLoading={handleStake.isLoading || exchangeRate.isLoading}
                    disabled={
                      handleStake.isLoading ||
                      !pk ||
                      !enteredSolAmount ||
                      exchangeRate.isLoading ||
                      insufficientSol
                    }
                    className="w-full"
                  >
                    {(insufficientSol && 'Insufficient Balance') || 'Stake'}
                  </Button>
                  {stakeError && (
                    <Text as="p" className="text-red-400">
                      {stakeError}
                    </Text>
                  )}
                </Tab.Panel>
                <Tab.Panel className="space-y-2" key="Unstake">
                  <AmountInput
                    symbol="stSOL"
                    amount={enteredStSolAmount}
                    setAmount={setEnteredStSolAmount}
                    max={lamportsToSol(stSolBalance.toNumber()).toString()}
                    logoURI={stSolInfo?.logoURI}
                  />
                  <Button
                    onClick={() =>
                      enteredStSolAmount &&
                      handleUnstake
                        .mutateAsync({ enteredAmount: parseFloat(enteredStSolAmount) })
                        .catch((e) => setUnstakeError((e as Error).toString()))
                    }
                    isLoading={handleUnstake.isLoading || exchangeRate.isLoading}
                    disabled={
                      handleUnstake.isLoading ||
                      !pk ||
                      !enteredStSolAmount ||
                      exchangeRate.isLoading ||
                      insufficientStSol
                    }
                    className="w-full"
                  >
                    {(insufficientStSol && 'Insufficient Balance') || 'Unstake'}
                  </Button>
                  {unstakeError && (
                    <Text as="p" className="text-red-400">
                      {unstakeError}
                    </Text>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          <div className="grid grid-cols-2 gap-2 relative">
            <Text size="sm" as="p">
              You will receive:
            </Text>
            <Text size="sm" as="p" className="text-right">
              ~ {willReceive.toFixed(4)} stSOL
            </Text>

            <Text size="sm" as="p">
              Exchange Rate:
            </Text>
            <Text size="sm" as="p" className="text-right">
              1 stSOL = ~{exchangeRate.data?.toFixed(4)} SOL
            </Text>

            <Text size="sm" as="p">
              Transaction Cost
            </Text>
            <Text size="sm" as="p" className="text-right">
              ~ 0.000005 SOL
            </Text>

            <Text size="sm" as="p">
              Lido staking rewards fee
            </Text>
            <Text size="sm" as="p" className="text-right">
              10%
            </Text>

            <Text size="sm" as="p">
              Lido Staking APR
            </Text>
            <Text weight="semibold" size="sm" as="p" className="text-right">
              {lidoStats.data?.apr.toFixed(2).concat('%') || (
                <Spinner className="absolute right-0" />
              )}
            </Text>
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-2">
        <Text size="xl" weight="bold" className="my-2">
          Staking overview
        </Text>
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

          {((stakeData.isLoading || !stakeData.isSuccess || stakeData.isFetching) && (
            <div>
              <Spinner className="inline-block" />
              <p className="inline-block">Searching staking accounts</p>
            </div>
          )) ||
            stakeData.data?.map((row) => (
              <StakedRow
                key={row.stakeAccount.toString()}
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
        <Text size="xl" weight="bold" className="my-2">
          Lido statistics
        </Text>
        <Card className="w-full p-2">
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
        </Card>
      </div>
    </div>
  );
};

class LidoPlugin extends Plugin implements EarnProvider {
  lidoStats: LidoStats | undefined;

  async getOrFetchlidoStats() {
    if (this.lidoStats) {
      return this.lidoStats;
    }

    return await fetchLidoStats();
  }

  async getOpportunityDepositTransactions(
    appContext: AppContext,
    _op: Opportunity,
    amount: number
  ) {
    const tx = await generateStakeTransaction(appContext.publicKey, amount, appContext.connection);
    return tx ? [tx] : [];
  }

  async getOpportunityWithdrawTransactions(
    appContext: AppContext,
    _op: Opportunity,
    amount: number
  ) {
    const tx = await generateUnstakeTransaction(
      appContext.publicKey,
      amount,
      appContext.connection
    );
    return tx ? [tx] : [];
  }

  async getOpportunityBalance(appContext: AppContext) {
    const foundAcc = appContext.tokenAccounts.find((acc) => acc.mint === stSolMint);

    if (!foundAcc) {
      return 0;
    }

    return parseInt(foundAcc.amount) ?? 0;
  }

  async getOpportunities() {
    console.log('lido loading');
    const stats = await this.getOrFetchlidoStats();

    return [
      {
        id: 'stake',
        title: `LIDO SOL Staking`,
        mint: 'sol',
        rate: (stats.apr ?? 0) * 100,
      },
    ];
  }

  async getOpportunitiesForMint(ctx: AppContext, mint: string) {
    if (mint !== 'sol') {
      return [];
    }

    console.log('lido loading');
    const stats = await this.getOrFetchlidoStats();

    return [
      {
        id: 'stake',
        title: `LIDO SOL Staking`,
        mint: 'sol',
        rate: (stats.apr ?? 0) * 100,
      },
    ];
  }

  async onload(): Promise<void> {
    this.addView({
      title: 'Stake',
      id: 'lido',
      component: Lido,
      icon: <LidoIcon className="h-5 w-5 ml-[3px]" />,
    });

    this.addTokenAction('sol', 'Stake with Lido', ({ pluginNavigate }) => {
      pluginNavigate('lido', new URLSearchParams({ action: 'stake' }));
    });

    this.addTokenAction(stSolMint, 'Unstake with Lido', ({ pluginNavigate }) => {
      pluginNavigate('lido', new URLSearchParams({ action: 'unstake' }));
    });
  }
}

export default LidoPlugin;
