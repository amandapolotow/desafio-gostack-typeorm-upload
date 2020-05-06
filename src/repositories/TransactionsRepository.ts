import { EntityRepository, Repository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialValueIncome = 0;
    const initialValueOutcome = 0;
    const transactionRepository = getRepository(Transaction);
    const transactions = await transactionRepository.find();

    const reducer = (
      accumulator: number,
      currentValue: Transaction,
    ): number => {
      return accumulator + Number(currentValue.value);
    };

    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce(reducer, initialValueIncome);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce(reducer, initialValueOutcome);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
