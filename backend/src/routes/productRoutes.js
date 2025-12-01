"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrcode_1 = __importDefault(require("qrcode"));
const product_model_1 = __importDefault(require("../models/product.model"));
const router = (0, express_1.Router)();
// POST /api/products
router.post("/", async (req, res) => {
    try {
        const { transactionHash, manufacturer, name, batchId, wholesaler, retailer, description, createdAt, } = req.body;
        const qrPayload = JSON.stringify({
            transactionHash,
            batchId,
            manufacturer,
        });
        // 2) Generate QR code as Data URL (base64 PNG)
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(qrPayload);
        console.log("qr code url:", qrCodeDataUrl);
        // 3) Create product document with qrCode
        const newProduct = await product_model_1.default.create({
            transactionHash,
            manufacturer,
            name,
            batchId,
            wholesaler,
            retailer,
            description,
            createdAt,
            qrCode: qrCodeDataUrl,
        });
        return res.status(201).json({
            success: true,
            message: "Product stored successfully",
            data: newProduct,
        });
    }
    catch (error) {
        console.error("Error saving product:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving product",
        });
    }
});
// GET /api/products?transactionHash=...
// GET /api/products/transaction/:transactionHash
router.get("/transaction/:transactionHash", async (req, res) => {
    try {
        const { transactionHash } = req.params;
        console.log("GET /transaction/:transactionHash", transactionHash);
        if (!transactionHash) {
            return res.status(400).json({
                success: false,
                message: "Missing transactionHash param",
            });
        }
        const product = await product_model_1.default.findOne({ transactionHash });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // 👇 Make this shape super simple
        return res.status(200).json({
            success: true,
            product,
        });
    }
    catch (error) {
        console.error("Error fetching product by hash:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching product",
        });
    }
});
router.get("/owner/:address", async (req, res) => {
    try {
        const { address } = req.params;
        const products = await product_model_1.default.find({ manufacturer: address });
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error("Error fetching owner's products:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
});
exports.default = router;
