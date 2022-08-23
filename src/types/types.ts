export type Transaction = {
  involvesWatchonly: boolean;
  account: string;
  address: string;
  category: "receive" | "send";
  amount: number;
  label: string;
  confirmations: number;
  blockhash: string;
  blockindex: number;
  blocktime: number;
  txid: string;
  vout: number;
  walletconflicts: [];
  time: number;
  timereceived: number;
  "bip125-replaceable": string;
};

export type TransactionsUnparsed = {
  transactions: Transaction[];
  removed: [];
  lastblock: string;
};

export type Customer = {
  name: string;
  address: string;
  balance: number;
  count: number;
};
