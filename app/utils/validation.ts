export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  private static instance: Validator;

  private constructor() {}

  public static getInstance(): Validator {
    if (!Validator.instance) {
      Validator.instance = new Validator();
    }
    return Validator.instance;
  }

  public validate(value: unknown, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public validateEmail(email: string): ValidationResult {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.validate(email, [
      {
        validate: (value: unknown): boolean =>
          typeof value === 'string' && emailPattern.test(value),
        message: '正しいメールアドレスを入力してください',
      },
    ]);
  }

  public validatePassword(password: string): ValidationResult {
    return this.validate(password, [
      {
        validate: (value: unknown): boolean => typeof value === 'string' && value.length >= 8,
        message: '8文字以上で入力してください',
      },
      {
        validate: (value: unknown): boolean => typeof value === 'string' && value.length <= 32,
        message: '32文字以下で入力してください',
      },
      {
        validate: (value: unknown): boolean =>
          typeof value === 'string' && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value),
        message: 'パスワードは大文字、小文字、数字を含む必要があります',
      },
    ]);
  }
}

export const validator = Validator.getInstance();
