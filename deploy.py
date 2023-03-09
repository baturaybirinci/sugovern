from web3 import Web3
import json
from web3.middleware import geth_poa_middleware

# set up web3 provider
w3 = Web3(Web3.HTTPProvider("https://rpc-mumbai.maticvigil.com/"))  # replace with your provider URL

# load contract JSON files
with open('./blockchain1/build/contracts/creator.json') as f:
    first_contract_data = json.load(f)

with open('./blockchain1/build/contracts/DAOFactory.json') as f:
    second_contract_data = json.load(f)

# Connect to Mumbai testnet
w3.middleware_onion.inject(geth_poa_middleware, layer=0)


# set up your wallet
private_key = open('./priv-key','r').readlines()[0].strip()
print(private_key)
account = w3.eth.account.privateKeyToAccount(private_key)

# set the default account
w3.eth.default_account = account.address
# create contract objects
first_contract_abi = first_contract_data['abi']
first_contract_bytecode = first_contract_data['bytecode']
first_contract = w3.eth.contract(abi=first_contract_abi, bytecode=first_contract_bytecode)

second_contract_abi = second_contract_data['abi']
second_contract_bytecode = second_contract_data['bytecode']
second_contract = w3.eth.contract(abi=second_contract_abi, bytecode=second_contract_bytecode)

# deploy first contract
first_tx_hash = first_contract.constructor().transact()
first_tx_receipt = w3.eth.waitForTransactionReceipt(first_tx_hash)

# get first contract address
first_contract_address = first_tx_receipt.contractAddress

# deploy second contract with first contract's address as constructor value
second_tx_hash = second_contract.constructor(first_contract_address).transact()
second_tx_receipt = w3.eth.waitForTransactionReceipt(second_tx_hash)

# get second contract address
second_contract_address = second_tx_receipt.contractAddress

print("First contract deployed at:", first_contract_address)
print("Second contract deployed at:", second_contract_address)
