import { Router, type Request, type Response } from "express";
import QRCode from "qrcode";
import Product from "../models/product.model";

const router = Router();

// POST /api/products
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      transactionHash,
      manufacturer,
      name,
      batchId,
      wholesaler,
      retailer,
      description,
      createdAt,
    } = req.body;


    const qrPayload = JSON.stringify({
      transactionHash,
      batchId,
      manufacturer,
    });

    // 2) Generate QR code as Data URL (base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload); 
    console.log("qr code url:", qrCodeDataUrl);

    // 3) Create product document with qrCode
    const newProduct = await Product.create({
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
  } catch (error) {
    console.error("Error saving product:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving product",
    });
  }
});

// GET /api/products?transactionHash=...
// GET /api/products/transaction/:transactionHash
router.get("/transaction/:transactionHash", async (req: Request, res: Response) => {
  try {
    const { transactionHash } = req.params;
    console.log("GET /transaction/:transactionHash", transactionHash);

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Missing transactionHash param",
      });
    }

    const product = await Product.findOne({ transactionHash });

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
  } catch (error) {
    console.error("Error fetching product by hash:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
});


router.get("/owner/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const products = await Product.find({ manufacturer: address });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching owner's products:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
});

export default router;