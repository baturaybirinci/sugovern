export const TOKEN_ADDRESS = '0x9bdcfc152af1e41eda76a9e12ec60fb216590c8f'
export const DAO_ADDRESS = '0x5702509538d1331b6E62391f25F22F209dAb9514'
export const FACTORY_JSON = require("./blockchain1/build/contracts/DAOFactory.json");
export const DAO_JSON = require("./blockchain1/build/contracts/MyDAO.json");
export const TOKEN_JSON = require('./blockchain1/build/contracts/SUToken.json');

export const params = [{
    chainName: 'Mumbai Testnet',
    chainId: '0x13881',
    nativeCurrency: {name: 'MATIC', decimals: 18, symbol: 'MATIC'},
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/your-api-key'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
}
]
export const CHAIN_ID = 8001