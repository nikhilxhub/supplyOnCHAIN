// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChainTracker {

    enum ProductStatus { Created, InTransit, InWarehouse, Delivered }

    struct Product {
        uint256 id;
        string name;
        string batchId;
        // SECURITY: The manufacturer is ALWAYS the person who created the product
        address manufacturer;        
        address assignedWholesaler; 
        address assignedRetailer;    
        address currentOwner;
        ProductStatus status;
        uint256 timestamp;
        bool exists;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;
    
    // We track which products an address currently owns
    mapping(address => uint256[]) private _ownerProducts;

    event ProductCreated(uint256 indexed id, address indexed manufacturer, address wholesaler, address retailer);
    event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    modifier onlyProductOwner(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        require(products[_id].currentOwner == msg.sender, "Not the owner of this product");
        _;
    }

    // --- 1. Create Product (OPEN TO PUBLIC) ---
    // Anyone can call this. 
    function createProduct(
        string memory _name, 
        string memory _batchId, 
        address _wholesaler, 
        address _retailer
    ) public {
        // Validation to prevent accidental zero-address errors
        require(_wholesaler != address(0), "Wholesaler address cannot be zero");
        require(_retailer != address(0), "Retailer address cannot be zero");

        productCount++;
        uint256 newId = productCount;

        products[newId] = Product({
            id: newId,
            name: _name,
            batchId: _batchId,
            // SECURITY CHECK: 
            // We do NOT ask the user "who is the manufacturer?". 
            // We automatically set it to msg.sender. 
            // This prevents Alice from creating a product and claiming it was made by Bob.
            manufacturer: msg.sender, 
            
            assignedWholesaler: _wholesaler,
            assignedRetailer: _retailer,
            currentOwner: msg.sender, // Manufacturer starts as the owner
            status: ProductStatus.Created,
            timestamp: block.timestamp,
            exists: true
        });

        _ownerProducts[msg.sender].push(newId);

        emit ProductCreated(newId, msg.sender, _wholesaler, _retailer);
    }

    // --- 2. Transfer Logic ---
    function transferOwnership(uint256 _id, address _newOwner) public onlyProductOwner(_id) {
        require(_newOwner != address(0), "Invalid address");
        
        Product storage p = products[_id];
        
        // Logic: You can only transfer to the people YOU defined in the struct
        
        // 1. Manufacturer -> Wholesaler
        if (msg.sender == p.manufacturer) {
            require(_newOwner == p.assignedWholesaler, "Can only send to assigned Wholesaler");
            p.status = ProductStatus.InTransit; 
        }
        // 2. Wholesaler -> Retailer
        else if (msg.sender == p.assignedWholesaler) {
            require(_newOwner == p.assignedRetailer, "Can only send to assigned Retailer");
            p.status = ProductStatus.InTransit;
        }
        // 3. Retailer -> Consumer
        else if (msg.sender == p.assignedRetailer) {
            p.status = ProductStatus.Delivered;
            // Any address can be the consumer, so we don't check against a specific variable here
        } 
        else {
            revert("Unauthorized transfer flow");
        }

        address oldOwner = p.currentOwner;
        p.currentOwner = _newOwner;
        p.timestamp = block.timestamp;

        _removeProductIdFromOwner(oldOwner, _id);
        _ownerProducts[_newOwner].push(_id);

        emit OwnershipTransferred(_id, oldOwner, _newOwner, block.timestamp);
    }

    // Helper to manage the arrays
    function _removeProductIdFromOwner(address owner, uint256 productId) internal {
        uint256[] storage ownerList = _ownerProducts[owner];
        for (uint256 i = 0; i < ownerList.length; i++) {
            if (ownerList[i] == productId) {
                ownerList[i] = ownerList[ownerList.length - 1];
                ownerList.pop();
                break;
            }
        }
    }

    // --- View Functions ---

    function getProduct(uint256 _id) public view returns (Product memory) {
        require(products[_id].exists, "Product does not exist");
        return products[_id];
    }

    function getProductsByOwner(address _owner) public view returns (uint256[] memory) {
        return _ownerProducts[_owner];
    }
}