export interface UserProps {
  id: string;
  email: string;
  createdAt: Date;
}

export class User {
  readonly id: string;
  email: string;
  readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.createdAt = props.createdAt;
  }

  static create(email: string): User {
    const id = crypto.randomUUID();
    return new User({
      id,
      email,
      createdAt: new Date(),
    });
  }
}