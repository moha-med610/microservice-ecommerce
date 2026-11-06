import { GENDER_ENUM } from '@shared/common/enums/gender.enum.js';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  @IsPhoneNumber()
  @IsNotEmpty()
  number: string;
}
