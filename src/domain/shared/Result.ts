export type ResultProps<T> = {
  isSuccess: boolean;
  data?: T;
  error?: Error | string;
};

export class Result<T = void> {
  public readonly isSuccess: boolean;
  public readonly data?: T;
  public readonly error?: Error | string;

  private constructor(props: ResultProps<T>) {
    this.isSuccess = props.isSuccess;
    this.data = props.data;
    this.error = props.error;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value from failed result: ${this.error}`);
    }
    return this.data!;
  }

  public getErrorValue(): Error | string {
    if (this.isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this.error!;
  }

  public static success<T>(data: T): Result<T> {
    return new Result<T>({
      isSuccess: true,
      data,
      error: undefined,
    });
  }

  public static successVoid(): Result<void> {
    return new Result<void>({
      isSuccess: true,
      data: undefined,
      error: undefined,
    });
  }

  public static failure<T = unknown>(error: Error | string): Result<T> {
    return new Result<T>({
      isSuccess: false,
      data: undefined,
      error,
    });
  }

  public static combine(results: Array<Result<any>>): Result<void> {
    for (const result of results) {
      if (!result.isSuccess) {
        return Result.failure<void>(result.error!);
      }
    }
    return Result.successVoid();
  }
}

export type Either<L, A> = Result<A> & {
  isLeft: () => this is Result<L>;
  isRight: () => this is Result<A>;
};