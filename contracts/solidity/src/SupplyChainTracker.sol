// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChainTracker {

    enum ProductStatus { Created, InTransit, InWarehouse, Delivered }

    struct Product {
        uint256 id;
        string name;
        string batchId;
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
    
  
    mapping(address => uint256[]) private _ownerProducts;


    mapping(address => uint256[]) private _createdProducts;

    mapping(string => uint256) public batchIdToProductId;

    event ProductCreated(uint256 indexed id, address indexed manufacturer, address wholesaler, address retailer);
    event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    modifier onlyProductOwner(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        require(products[_id].currentOwner == msg.sender, "Not the owner of this product");
        _;
    }

    function createProduct(
        string memory _name, 
        string memory _batchId, 
        address _wholesaler, 
        address _retailer
    ) public {
        require(_wholesaler != address(0), "Wholesaler address cannot be zero");
        require(_retailer != address(0), "Retailer address cannot be zero");
        require(batchIdToProductId[_batchId] == 0, "Batch ID already exists");

        productCount++;
        uint256 newId = productCount;

        products[newId] = Product({
            id: newId,
            name: _name,
            batchId: _batchId,
            manufacturer: msg.sender, 
            assignedWholesaler: _wholesaler,
            assignedRetailer: _retailer,
            currentOwner: msg.sender,
            status: ProductStatus.Created,
            timestamp: block.timestamp,
            exists: true
        });

        // Add to Current Owner list
        _ownerProducts[msg.sender].push(newId);
        
    
        _createdProducts[msg.sender].push(newId);
        
        batchIdToProductId[_batchId] = newId;

        emit ProductCreated(newId, msg.sender, _wholesaler, _retailer);
    }

    function transferOwnership(uint256 _id, address _newOwner) public onlyProductOwner(_id) {
        require(_newOwner != address(0), "Invalid address");
        
        Product storage p = products[_id];
        
        // Logic unchanged...
        if (msg.sender == p.manufacturer) {
            require(_newOwner == p.assignedWholesaler, "Can only send to assigned Wholesaler");
            p.status = ProductStatus.InTransit; 
        }
        else if (msg.sender == p.assignedWholesaler) {
            require(_newOwner == p.assignedRetailer, "Can only send to assigned Retailer");
            p.status = ProductStatus.InWarehouse;
        }
        else if (msg.sender == p.assignedRetailer) {
            p.status = ProductStatus.Delivered;
        } 
        else {
            revert("Unauthorized transfer flow");
        }

        address oldOwner = p.currentOwner;
        p.currentOwner = _newOwner;
        p.timestamp = block.timestamp;

        // Remove from OLD owner's current list
        _removeProductIdFromOwner(oldOwner, _id);
        
        // Add to NEW owner's current list
        _ownerProducts[_newOwner].push(_id);
        
        // NOTE: We do NOT remove it from _createdProducts. The manufacturer created it forever.

        emit OwnershipTransferred(_id, oldOwner, _newOwner, block.timestamp);
    }

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

    function getProduct(uint256 _id) public view returns (Product memory) {
        require(products[_id].exists, "Product does not exist");
        return products[_id];
    }

    function getProductsByOwner(address _owner) public view returns (uint256[] memory) {
        return _ownerProducts[_owner];
    }

    //  Function to get products created by a manufacturer
    function getProductsCreatedBy(address _creator) public view returns (uint256[] memory) {
        return _createdProducts[_creator];
    }

    function getProductIdByBatchId(string memory _batchId) public view returns (uint256) {
        return batchIdToProductId[_batchId];
    }
}