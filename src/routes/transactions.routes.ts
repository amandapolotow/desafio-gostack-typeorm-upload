import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

const createTransaction = new CreateTransactionService();
const deleteTransaction = new DeleteTransactionService();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();

  const transactions = await transactionsRepository
    .createQueryBuilder('transactions')
    .leftJoinAndSelect('transactions.category', 'categories')
    .getMany();

  const transactionsBalance = {
    transactions,
    balance,
  };

  return response.json(transactionsBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  try {
    const transaction = await createTransaction.execute({
      title,
      type,
      value,
      categoryTitle: category,
    });
    return response.json(transaction);
  } catch (error) {
    return response
      .status(error.statusCode)
      .json({ message: error.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  try {
    await deleteTransaction.execute(id);
    return response.status(204).send();
  } catch (error) {
    return response
      .status(error.statusCode)
      .json({ message: error.message, status: 'error' });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
