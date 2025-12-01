"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    transactionHash: { type: String, required: true },
    manufacturer: { type: String, required: true },
    name: { type: String, required: true },
    batchId: { type: String, required: true },
    wholesaler: { type: String, required: true },
    retailer: { type: String, required: true },
    description: { type: String, required: false },
    createdAt: { type: String, required: true },
    qrCode: { type: String, required: true },
});
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
