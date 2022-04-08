export default interface ParsedStakeAccount {
  type: string;
  info: {
    meta: {
      authorized: {
        staker: string;
        withdrawer: string;
      };
      lockup: {
        custodian: string;
        epoch: number;
        unixTimestamp: number;
      };
      rentExemptReserve: string;
    };
    stake: {
      creditsObserved: number;
      delegation: {
        activationEpoch: string;
        deactivationEpoch: string;
        stake: string;
        voter: string;
        warmupCooldownRate: 0.25;
      };
    };
  };
}
