import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { parsePhoneNumberFromString } from 'libphonenumber-js';

@ValidatorConstraint({
  name: 'IsValidInternationalPhone',
  async: false,
})
export class IsValidInternationalPhone implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const phone = args.object as {
      code?: string;
      number?: string;
    };

    if (
      typeof phone.code !== 'string' ||
      typeof value !== 'string' ||
      !phone.code ||
      !value
    ) {
      return false;
    }

    try {
      const parsed = parsePhoneNumberFromString(`${phone.code}${value}`);

      return parsed?.isValid() ?? false;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Invalid international phone number';
  }
}
