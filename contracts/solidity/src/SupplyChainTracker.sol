// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChainTracker {

    enum Role { None, Manufacturer, Wholesaler, Retailer, Consumer }
    enum ProductStatus { Created, InTransit, InWarehouse, Delivered }

    struct Product {
        uint256 id;
        string name;
        string batchId;
        address currentOwner;
        ProductStatus status;
        uint256 timestamp;
        bool exists;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;
    mapping(address => Role) public participants;
    address public admin;

   
    mapping(address => uint256[]) private _ownerProducts;

    event ParticipantRegistered(address indexed participant, Role role);
    event ProductCreated(uint256 indexed id, string name, string batchId, address indexed owner, uint256 timestamp);
    event ProductStatusUpdated(uint256 indexed id, ProductStatus status, uint256 timestamp, address indexed updatedBy);
    event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRole(Role _role) {
        require(participants[msg.sender] == _role, "Unauthorized: Incorrect Role");
        _;
    }

    modifier onlyProductOwner(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        require(products[_id].currentOwner == msg.sender, "Not the owner of this product");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerParticipant(address _participant, Role _role) public onlyAdmin {
        require(_participant != address(0), "Invalid address");
        participants[_participant] = _role;
        emit ParticipantRegistered(_participant, _role);
    }

    function createProduct(string memory _name, string memory _batchId) public onlyRole(Role.Manufacturer) {
        productCount++;
        uint256 newId = productCount;

        products[newId] = Product({
            id: newId,
            name: _name,
            batchId: _batchId,
            currentOwner: msg.sender,
            status: ProductStatus.Created,
            timestamp: block.timestamp,
            exists: true
        });


        _ownerProducts[msg.sender].push(newId);

        emit ProductCreated(newId, _name, _batchId, msg.sender, block.timestamp);
    }

    function updateStatus(uint256 _id, ProductStatus _newStatus) public onlyProductOwner(_id) {
        require(products[_id].exists, "Product does not exist");
        products[_id].status = _newStatus;
        products[_id].timestamp = block.timestamp;
        emit ProductStatusUpdated(_id, _newStatus, block.timestamp, msg.sender);
    }


    function transferOwnership(uint256 _id, address _newOwner) public onlyProductOwner(_id) {
        require(_newOwner != address(0), "Invalid address");
        
        Role senderRole = participants[msg.sender];
        Role receiverRole = participants[_newOwner];

        if (senderRole == Role.Manufacturer) {
            require(receiverRole == Role.Wholesaler, "Manufacturers must send to Wholesalers");
        } else if (senderRole == Role.Wholesaler) {
            require(receiverRole == Role.Retailer, "Wholesalers must send to Retailers");
        } else if (senderRole == Role.Retailer) {
            require(receiverRole == Role.Consumer, "Retailers must send to Consumers");
        } else {
            revert("Invalid Supply Chain Flow");
        }

        address oldOwner = products[_id].currentOwner;

        // 1. Update Struct
        products[_id].currentOwner = _newOwner;
        products[_id].timestamp = block.timestamp;
        
        if (receiverRole == Role.Consumer) {
             products[_id].status = ProductStatus.Delivered;
        } else {
             products[_id].status = ProductStatus.InTransit;
        }

        // 2. MOVE PRODUCT ID: Remove from Old Owner, Add to New Owner
        _removeProductIdFromOwner(oldOwner, _id);
        _ownerProducts[_newOwner].push(_id);

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
}