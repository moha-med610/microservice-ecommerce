import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Phone {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  number: string;
}

export const PhoneSchema = SchemaFactory.createForClass(Phone);
