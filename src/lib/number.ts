import numeral from 'numeral';

export const lamportsToSol = (lamports?: number, decimals = 9) =>
  lamports ? lamports / Math.pow(10, decimals) : 0;

export const solToLamports = (sol: number, decimals = 9) => sol * Math.pow(10, decimals);

export const lamportsToSolString = (lamports = 0, decimals = 2) => {
  try {
    const lp = parseFloat(`${lamports}`);
    if (!lp) {
      return '0';
    }

    return (lp / 1000000000).toFixed(decimals);
  } catch (e) {
    return '0';
  }
};

export const lamportsToUSD = (lamports: number, price?: number, decimals = 9) =>
  price ? displayUSD(lamportsToSol(lamports, decimals) * price) : '-';

export const displayUSD = (v?: number) => {
  if (!v) {
    return '-';
  }
  return numeral(v).format('$0,0.00');
};

export const displayPercentage = (p?: number) => numeral(p).format('0.00%');
