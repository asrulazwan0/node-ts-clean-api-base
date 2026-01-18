import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/user/use-cases/create-user-use-case';
import { Result } from '../../../domain/shared/Result';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<any> {
    const { email, name, password } = req.body;

    const result = await this.createUserUseCase.execute({ email, name, password });

    if (!result.isSuccess) {
      const error = result.error;
      if ((error as any)?.type === 'validation_error') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: (error as any)?.errors || [(error as any)?.message],
        });
      } else if ((error as any)?.type === 'business_rule_violation') {
        return res.status(409).json({
          success: false,
          message: (error as any)?.message,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.data,
    });
  }
}