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

  public static success<T>(data?: T): Result<T> {
    return new Result({
      isSuccess: true,
      data,
      error: undefined,
    });
  }

  public static failure<T>(error: Error | string): Result<T> {
    return new Result({
      isSuccess: false,
      data: undefined,
      error,
    });
  }

  public static combine(results: Result[]): Result<void> {
    for (const result of results) {
      if (!result.isSuccess) {
        return Result.failure(result.error);
      }
    }
    return Result.success();
  }
}

export type Either<L, A> = Result<A> & {
  isLeft: () => this is Result<L>;
  isRight: () => this is Result<A>;
};