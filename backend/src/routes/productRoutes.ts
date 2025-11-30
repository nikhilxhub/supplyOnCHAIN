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

    // 1) Decide what to encode into the QR
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
