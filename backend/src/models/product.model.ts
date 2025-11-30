import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  transactionHash: string;
  manufacturer: string;
  name: string;
  batchId: string;
  wholesaler: string;
  retailer: string;
  description: string;
  createdAt: string;
  qrCode:string;
}

const ProductSchema = new Schema<IProduct>({
  transactionHash: { type: String, required: true },
  manufacturer: { type: String, required: true },

  name: { type: String, required: true },
  batchId: { type: String, required: true },
  wholesaler: { type: String, required: true },
  retailer: { type: String, required: true },

  description: { type: String, required: false },

  createdAt: { type: String, required: true },
  qrCode:{ type: String,required: true },
});

export default model<IProduct>("Product", ProductSchema);
