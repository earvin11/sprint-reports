import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class HistoryCrupier extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Crupier' })
  crupier: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Game' })
  game: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const HistoryCrupierSchema =
  SchemaFactory.createForClass(HistoryCrupier);
