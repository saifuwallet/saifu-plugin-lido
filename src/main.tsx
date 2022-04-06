import './style.css';

import solido, { getExchangeRate, getStSolSupply } from '@chorusone/solido.js';
import { Plugin, ViewProps } from '@saifuwallet/saifu';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { FunctionComponent, useEffect, useState } from 'react';

import Button from './components/Button';
import { LidoIcon, LidoIconText } from './components/Icon';

const Lido: FunctionComponent<ViewProps> = ({ app }) => {
  const connection = app.hooks.useConnection();
  const lamportsPerSol = new BN(LAMPORTS_PER_SOL);

  const [amount, setAmount] = useState(3);

  const [tvl, setTvl] = useState(new BN(0));
  const [exchangeRate, setExchangeRate] = useState(0);
  const [stSolSupply, setStSolSupply] = useState(new BN(0));

  const willReceive = amount * exchangeRate;

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
              type="text"
              placeholder="Amount"
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              value={amount}
            />
          </div>
          <div className="">
            <Button className="w-full my-8" text="Stake SOL"></Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <p>You will receive:</p>
            <p className="text-right">~ {willReceive.toFixed(4)} stSOL</p>
            <p>Exchange Rate:</p>
            <p className="text-right">1 stSOL = ~{exchangeRate.toFixed(4)} SOL</p>
            <p>Transaction Cost</p>
            <p className="text-right">~ 0.000005 SOL</p>
            <p>Lido staking rewards fee</p>
            <p className="text-right">10%</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold my-2">Lido statistics</h2>
        <div className="w-full bg-white rounded-md ">
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <p>Total staked with Lido:</p>
              <p className="text-right">{tvl.div(lamportsPerSol).toString()} SOL</p>
              <p>supply:</p>
              <p className="text-right">{stSolSupply.div(lamportsPerSol).toString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class SolendPlugin extends Plugin {
  name = 'Solend View';
  description = 'Plugin to view your Solend Obligations';
  id = 'solend-pluginsss';

  async onload(): Promise<void> {
    this.addView({
      title: 'Lido Staking',
      id: 'lido',
      component: Lido,
      icon: <LidoIcon variant="white" className="h-5 w-5" />,
    });
  }
}

export default SolendPlugin;
