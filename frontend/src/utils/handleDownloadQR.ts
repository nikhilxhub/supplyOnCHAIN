// Define the shape of the product object expected
interface ProductData {
    name: string;
    qrCode: string;
    [key: string]: any; // Allow other properties
}

export const handleDownloadQR = (selectedProduct: ProductData | null) => {
    if (!selectedProduct || !selectedProduct.qrCode) return;

    // 1. Create a temporary anchor element
    const link = document.createElement('a');
    
    // 2. Set the href to the Base64 image data
    link.href = selectedProduct.qrCode;
    
    // 3. Generate a clean filename 
    const cleanName = selectedProduct.name.replace(/\s+/g, '_').toLowerCase();
    link.download = `${cleanName}_qr.png`;
    
    // 4. Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};