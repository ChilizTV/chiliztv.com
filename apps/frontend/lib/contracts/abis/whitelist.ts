export const whitelistAbi = [
    {
        "inputs": [
        {
            "internalType": "address",
            "name": "_user",
            "type": "address"
        }
        ],
        "name": "isWhitelisted",
        "outputs": [
        {
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
        {
            "internalType": "address[]",
            "name": "_users",
            "type": "address[]"
        }
        ],
        "name": "whitelistUsers",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const