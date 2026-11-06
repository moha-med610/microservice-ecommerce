import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GENDER_ENUM } from '../../../../../shared/common/enums/gender.enum.js';
import { Phone, PhoneSchema } from './phone.schema.js';

@Schema()
export class Users {
  @Prop({ required: true, unique: true, index: true })
  authId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ required: false })
  avatarUrl: string;

  @Prop({ required: false })
  avatarPublicId: string;

  /**
   * 0 => Male
   * 1 => Female
   */
  @Prop({
    required: false,
    enum: GENDER_ENUM,
    type: Number,
    default: GENDER_ENUM.NOT_PREFER_TO_ANSWER,
  })
  gender: GENDER_ENUM;

  /**
   * {
   * code: string
   * number: string
   * }
   */
  @Prop({ type: [PhoneSchema], default: [] })
  phones: Phone[];
}

export const UsersSchema = SchemaFactory.createForClass(Users);

export type UsersDocument = HydratedDocument<Users>;

export const UsersModel = MongooseModule.forFeature([
  { name: Users.name, schema: UsersSchema },
]);
