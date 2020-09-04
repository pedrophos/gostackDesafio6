import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();
      if (value > total) {
        throw new AppError('not enough balance for this operation');
      }
    }

    let categoryFound = await categoryRepository.findOne({
      where: { title: category },
    });

    // console.log(categoryFound);

    if (!categoryFound) {
      categoryFound = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryFound);
    }

    const category_id = categoryFound.id;

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
