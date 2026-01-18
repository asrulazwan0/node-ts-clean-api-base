import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/user/use-cases/create-user-use-case';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      const output = await this.createUserUseCase.execute({ email });

      return res.status(201).json(output);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}