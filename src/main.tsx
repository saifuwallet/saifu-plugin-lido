import { Tab } from '@headlessui/react';
import BN from 'bn.js';
import clsx from 'clsx';
// eslint-disable-next-line import/no-unresolved
import { FunctionComponent, useMemo, useState } from 'react';
import { Plugin, useParams, usePublicKey, useTokenAccounts, useTokenInfos } from 'saifu';

import useHandleWithdraw from '@/hooks/useHandleWithdraw';
import useStsolExchangeRate from '@/hooks/useStsolExchangeRate';
import useValidatorStakeData from '@/hooks/useValidatorStakeData';

import AmountInput from './components/AmountInput';
import Button from './components/Button';
import { LidoIcon, LidoIconText } from './components/Icon';
import Spinner from './components/Spinner';
import StakedRow from './components/StakedRow';
import TokenBalance from './components/TokenBalance';
import useHandleStake from './hooks/useHandleStake';
import useHandleUnstake from './hooks/useHandleUnstake';
import useLidoStats from './hooks/useLidoStats';
import { lamportsToSol } from './lib/number';
import './style.css';

const stSolMint = '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj';

const actionToTabindex = (action: string | null) => {
  if (!action || action === 'stake') {
    return 0;
  }
  return 1;
};

const Lido: FunctionComponent = () => {
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
      <div className="w-full bg-white rounded-md">
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
                    setValue={setEnteredSolAmount}
                    symbol="SOL"
                    logoUrl={solInfo?.logoURI}
                    value={enteredSolAmount}
                    balance={lamportsToSol(solBalance.toNumber())}
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
                    text={(insufficientSol && 'Insufficient Balance') || 'Stake'}
                  />
                  <p className="text-red-400">{stakeError}</p>
                </Tab.Panel>
                <Tab.Panel className="space-y-2" key="Unstake">
                  <AmountInput
                    symbol="stSOL"
                    value={enteredStSolAmount}
                    setValue={(amount) => {
                      setEnteredStSolAmount(amount);
                    }}
                    balance={lamportsToSol(stSolBalance.toNumber())}
                    logoUrl={stSolInfo?.logoURI}
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
                    text={(insufficientStSol && 'Insufficient Balance') || 'Unstake'}
                  />
                  <p className="text-red-400">{unstakeError}</p>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <p>You will receive:</p>
            <p className="text-right">~ {willReceive.toFixed(4)} stSOL</p>

            <p>Exchange Rate:</p>
            <p className="text-right">1 stSOL = ~{exchangeRate.data?.toFixed(4)} SOL</p>

            <p>Transaction Cost</p>
            <p className="text-right">~ 0.000005 SOL</p>

            <p>Lido staking rewards fee</p>
            <p className="text-right">10%</p>

            <p>Lido Staking APR</p>
            <p className="text-right font-bold">
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

    // this.addTokenAction(
    //   ({ tokenInfo }) => tokenInfo.symbol === 'stSOL',
    //   'Unstake with Lido',
    //   ({ pluginNavigate }) => {
    //     pluginNavigate('lido', new URLSearchParams({ action: 'unstake' }));
    //   }
    // );
  }
}

export default LidoPlugin;
