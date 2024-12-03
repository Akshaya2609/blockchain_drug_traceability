// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DrugTraceability {
    // Struct for storing transaction details
    struct Transaction {
        address sender;
        address recipient;
        string drugName;
        uint256 timestamp;
    }

    // Struct for storing block details
    struct Block {
        uint256 index;
        uint256 timestamp;
        Transaction[] transactions;
        uint256 proof;
        string previousHash;
    }

    // Blockchain and transaction storage
    Block[] public blockchain;
    Transaction[] public currentTransactions;

    // Mapping from recipient name to address
    mapping(string => address) public recipientAddresses;

    // Events
    event NewBlock(uint256 index, uint256 timestamp, uint256 proof, string previousHash);
    event NewTransaction(address indexed sender, address indexed recipient, string drugName, uint256 timestamp);
    event RecipientRegistered(string name, address recipient);

    // Constructor to create the genesis block and assign a default recipient
    constructor() {
        // Create the genesis block
        _createBlock(100, "GENESIS_HASH");

        // Register a default recipient ("John Doe") for testing
        address johnDoeAddress = 0x1234567890AbcdEF1234567890aBcdef12345678; // Correct checksummed address

        registerRecipient("John Doe", johnDoeAddress);
    }

    // Private function to create a new block
    function _createBlock(uint256 proof, string memory previousHash) private {
        Block storage newBlock = blockchain.push();

        newBlock.index = blockchain.length; // Starts from 1 since it's length
        newBlock.timestamp = block.timestamp;
        newBlock.proof = proof;
        newBlock.previousHash = previousHash;

        // Copy transactions from currentTransactions to the new block's transaction array
        for (uint256 i = 0; i < currentTransactions.length; i++) {
            newBlock.transactions.push(currentTransactions[i]);
        }

        // Clear currentTransactions
        delete currentTransactions;

        emit NewBlock(newBlock.index, newBlock.timestamp, proof, previousHash);
    }

    // Function to register a recipient name and address
    function registerRecipient(string memory recipientName, address recipientAddress) public {
        require(recipientAddress != address(0), "Invalid address");
        recipientAddresses[recipientName] = recipientAddress;

        emit RecipientRegistered(recipientName, recipientAddress);
    }

    // Function to create a new transaction
    function createTransaction(string memory recipientName, string memory drugName) public {
        // Get recipient address by name
        address recipient = recipientAddresses[recipientName];
        require(recipient != address(0), "Recipient address not found");

        // Create a new transaction
        Transaction memory transaction = Transaction({
            sender: msg.sender,
            recipient: recipient,
            drugName: drugName,
            timestamp: block.timestamp
        });

        currentTransactions.push(transaction);

        emit NewTransaction(msg.sender, recipient, drugName, block.timestamp);
    }

    // Function to mine a new block
    function mineBlock(uint256 proof) public {
        string memory previousHash = _hashLastBlock();
        _createBlock(proof, previousHash);
    }

    // Private function to hash the last block
    function _hashLastBlock() private view returns (string memory) {
        if (blockchain.length == 0) {
            return "GENESIS_HASH";
        }

        Block storage lastBlock = blockchain[blockchain.length - 1];
        return _hashBlock(lastBlock);
    }

    // Private function to hash a block
    function _hashBlock(Block storage targetBlock) private view returns (string memory) {
        // Serialize block data
        string memory blockData = string(
            abi.encodePacked(
                targetBlock.index,
                targetBlock.timestamp,
                targetBlock.proof,
                targetBlock.previousHash
            )
        );

        return _toHexString(keccak256(abi.encodePacked(blockData)));
    }

    // Private function to convert bytes32 to hexadecimal string
    function _toHexString(bytes32 hash) private pure returns (string memory) {
        // Convert bytes32 to hexadecimal string
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);

        for (uint256 i = 0; i < 32; i++) {
            str[i * 2] = alphabet[uint8(hash[i] >> 4)];
            str[1 + i * 2] = alphabet[uint8(hash[i] & 0x0f)];
        }

        return string(str);
    }

    // Getter functions
    function getBlockchain() public view returns (Block[] memory) {
        return blockchain;
    }

    function getCurrentTransactions() public view returns (Transaction[] memory) {
        return currentTransactions;
    }
}
