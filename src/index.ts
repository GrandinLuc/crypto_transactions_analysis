import { readFileSync } from "fs";
import { TransactionsUnparsed, Transaction, Customer } from "./types/types";

// List of all customers in a raw format
let knownCustomersRaw = [
  "Wesley Crusher: mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ",
  "Leonard McCoy: mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp",
  "Jonathan Archer: mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n",
  "Jadzia Dax: 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo",
  "Montgomery Scott: mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8",
  "James T. Kirk: miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM",
  "Spock: mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV",
];

// All the known customers in a more easily usable format
let knownCustomers: Customer[] = knownCustomersRaw.map((e) => {
  let splittedCustomer = e.split(": ");

  return {
    name: splittedCustomer[0],
    address: splittedCustomer[1],
    balance: 0,
    count: 0,
  };
});

// We read both files
let transactions_1_raw = readFileSync("./transactions-1.json");
let transactions_2_raw = readFileSync("./transactions-2.json");

// We parse the resulting Buffer
let transactions_1: TransactionsUnparsed = JSON.parse(
  transactions_1_raw.toString()
);
let transactions_2: TransactionsUnparsed = JSON.parse(
  transactions_2_raw.toString()
);

// We merge all the transactions into a single object
let merged_transactions = {
  transactions: transactions_1.transactions.concat(transactions_2.transactions),
};

// We sort the transactions by the time of the block to make sure there is no double spend
merged_transactions.transactions.sort(
  (a: Transaction, b: Transaction) => a.blocktime - b.blocktime
);

let nonCustomers: Customer[] = [];

let smallestDeposit = Infinity;
let highestDeposit = -1;

for (let tx of merged_transactions.transactions) {
  let isAddressInList = false;
  for (let customer of knownCustomers) {
    if (tx.address == customer.address) {
      // Check the validity of the transaction
      if (customer.balance > -tx.amount) {
        customer.balance += tx.amount;
        customer.count += 1;
        if (tx.amount > 0 && tx.amount < smallestDeposit) {
          smallestDeposit = tx.amount;
        } else if (tx.amount > 0 && tx.amount > highestDeposit) {
          highestDeposit = tx.amount;
        }
      } else {
        // console.error("Having a negative balance is forbidden to customers");
      }
      isAddressInList = true;
    }
  }
  for (let nonCustomer of nonCustomers) {
    if (tx.address == nonCustomer.address) {
      if (nonCustomer.balance > -tx.amount) {
        nonCustomer.balance += tx.amount;
        nonCustomer.count += 1;
      } else {
        // console.error(
        //   "Having a negative balance is forbidden to tracked non-customers"
        // );
      }
      isAddressInList = true;
    }
  }

  if (!isAddressInList) {
    if (-tx.amount > 0) {
      nonCustomers.push({
        name: `Non customer #${nonCustomers.length.toString()}`,
        address: tx.address,
        balance: -tx.amount,
        count: 1,
      });
    } else {
      // console.error(
      //   "Having a negative balance is forbidden to untracked non-customers"
      // );
    }
  }
}

const formatAmount = (inputNumber: number) => {
  let res = (
    Math.round(inputNumber * Math.pow(10, 8)) / Math.pow(10, 8)
  ).toLocaleString("fullwide", {
    useGrouping: false,
    maximumFractionDigits: 8,
  });
  res = res.replace(",", ".");
  if (!res.includes(".")) {
    res += ".";
  }
  while (res.split(".")[1].length < 8) {
    res += "0";
  }

  return res;
};

// Format of the data return by all the code after this comment:
//
// Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
// Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
// Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
// Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
// Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
// Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
// Deposited for Spock: count=n sum=x.xxxxxxxx
// Deposited without reference: count=n sum=x.xxxxxxxx
// Smallest valid deposit: x.xxxxxxxx
// Largest valid deposit: x.xxxxxxxx

for (let customer of knownCustomers) {
  console.log(
    `Deposited for ${customer.name}: count=${customer.count} sum=${formatAmount(
      customer.balance
    )}`
  );
}

console.log(`Smallest valid deposit: ${formatAmount(smallestDeposit)}`);
console.log(`Largest valid deposit: ${formatAmount(highestDeposit)}`);
