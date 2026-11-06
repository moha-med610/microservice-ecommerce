import { IsValidInternationalPhone } from '@shared/common/decorators/valid-phone-number.decorator.js';
import { GENDER_ENUM } from '@shared/common/enums/gender.enum.js';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
  ValidateNested,
} from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(GENDER_ENUM)
  @Type(() => Number)
  gender: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phone: PhoneDto[];
}

class PhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{0,2}$/, {
    message: 'Country phone code must start with + and contain 1 to 3 digits',
  })
  code: string;

  @Validate(IsValidInternationalPhone)
  @IsNotEmpty()
  number: string;
}
