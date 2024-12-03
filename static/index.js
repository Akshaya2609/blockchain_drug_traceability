// Initialize Web3 with a provider (using MetaMask for example)
const web3 = new Web3(Web3.givenProvider || "http://localhost:7545"); // Assuming Ganache or similar network

// DOM Elements
const mineBtn = document.getElementById('mineBtn');
const createTransactionBtn = document.getElementById('createTransactionBtn');
const getChainBtn = document.getElementById('getChainBtn'); // Assuming you have a button for fetching the blockchain
const mineResponse = document.getElementById('mineResponse');
const transactionResponse = document.getElementById('transactionResponse');
const chainResponse = document.getElementById('chainResponse');

// Fetch contract ABI dynamically from the static folder
async function loadContract() {
    try {
        const contractABI = await fetch("/static/contractABI.json")
            .then(response => response.json());  // Parse the JSON response

        // Set the contract address (replace this with your deployed contract address)
        const contractAddress = "0x03c90cA6a22474512e4E28555Cb1B3CD85b43fFf";  // Replace with your actual contract address
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Add event listeners after contract is loaded
        addEventListeners(contract);
    } catch (error) {
        console.error("Error loading contract ABI:", error);
    }
}

// Add event listeners for buttons (only after contract is loaded)
function addEventListeners(contract) {
    // Handle mining a new block
    mineBtn.addEventListener('click', async () => {
        // Request account access if not already granted
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        }

        // Get accounts from MetaMask
        const accounts = await web3.eth.getAccounts();

        if (!accounts.length) {
            mineResponse.innerHTML = "No accounts found. Please connect MetaMask.";
            return;
        }
        
        const proof = 12345;  // Placeholder proof, replace with actual logic if necessary
        contract.methods.mineBlock(proof).send({ from: accounts[0] }) // Passing proof as a parameter
            .then((result) => {
                // Redirect to a new page and pass the result via localStorage
                localStorage.setItem('blockResult', JSON.stringify(result));
                window.location.href = '/static/output.html';  // Redirect to the output page
            })
            .catch((error) => {
                console.error("Error while mining:", error);
                mineResponse.innerHTML = `Error: ${error.message}`;
            });
    });

    // Handle creating a new transaction
    createTransactionBtn.addEventListener('click', async () => {
        const recipientName = document.getElementById('recipient').value.trim();  // Get recipient name input
        const drugName = document.getElementById('drug_name').value.trim();  // Get drug name input
    
        // Validate recipient name and drug name (ensure they're not empty)
        if (!recipientName || !drugName) {
            alert('Please provide both recipient name and drug name');
            return;
        }
    
        // Get the current account from MetaMask
        const accounts = await web3.eth.getAccounts();
        if (!accounts.length) {
            transactionResponse.innerHTML = "No accounts found. Please connect MetaMask.";
            return;
        }

        // Fetch the recipient address for the recipient name from the contract
        try {
            const recipientAddress = await contract.methods.recipientAddresses(recipientName).call();
            
            // Check if the recipient address is valid
            if (recipientAddress === '0x0000000000000000000000000000000000000000') {
                alert('No recipient found for this name');
                return;
            }

            // Send the transaction to the contract
            contract.methods.registerRecipient("John Doe", "0x1234567890abcdef1234567890abcdef12345678").send({ from: yourAddress });

            contract.methods.createTransaction(recipientName, drugName).send({ from: accounts[0] })
                .then((data) => {
                    transactionResponse.innerHTML = `Transaction created: ${JSON.stringify(data, null, 4)}`;
                    // Redirect to a new page and pass the transaction data
                    localStorage.setItem('transactionResult', JSON.stringify(data));
                    window.location.href = '/static/output.html';  // Redirect to the output page
                })
                .catch((error) => {
                    console.error("Error creating transaction:", error);
                    transactionResponse.innerHTML = `Error: ${error.message}`;
                });
        } catch (error) {
            console.error("Error fetching recipient address:", error);
            alert('Error fetching recipient address');
        }
    });

    // Handle getting the full blockchain
    getChainBtn.addEventListener('click', async () => {
        contract.methods.getBlockchain().call()  // Changed to getBlockchain()
            .then((data) => {
                chainResponse.innerHTML = `Blockchain: ${JSON.stringify(data, null, 4)}`;  // Show blockchain data
            })
            .catch((error) => {
                console.error("Error fetching blockchain:", error);
                chainResponse.innerHTML = `Error: ${error.message}`;
            });
    });
}

// Load the contract
loadContract();
