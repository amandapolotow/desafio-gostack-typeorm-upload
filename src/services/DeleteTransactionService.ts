import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction not found.');
    }

    const balance = await transactionsRepository.getBalance();

    if (
      transaction.type === 'income' &&
      balance.total - transaction.value < 0
    ) {
      throw new AppError('Balance cannot be negative.');
    } else {
      await transactionsRepository.delete(id);
    }
  }
}

export default DeleteTransactionService;
