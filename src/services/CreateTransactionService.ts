import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not enough balance for this transaction');
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: new Category(),
    });

    const categoryAlreadyExists = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    // checks if category already exists
    if (categoryAlreadyExists) {
      // updates category id in transaction
      transaction.category = categoryAlreadyExists;
    } else {
      // creates new category and updates category id in transaction
      const category = categoryRepository.create({
        title: categoryTitle,
      });

      await categoryRepository.save(category);
      transaction.category = category;
    }

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
