import { Schema } from 'mongoose';

export const GridFsModel = new Schema({
  filename: String,
  length: Number,
  chunkSize: Number,
  uploadDate: Date,
  metadata: Schema.Types.Mixed
});