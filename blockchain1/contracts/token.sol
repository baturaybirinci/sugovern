// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./itoken.sol";

/**
 * @title SUToken
 * @dev Custom implementation of a token contract that extends ERC20 and ISUToken interfaces.
 * This token contract adds functionality for delegation of tokens, locking and unlocking transfers,
 * and tracking token balances.
 */
contract SUToken is ISUToken, ERC20, Ownable {
    uint256 public proposal_num;
    address public myDAO;
    mapping(address => mapping(uint256 => bool)) public transferLock;
    address[] public dao_delegations;
    mapping(address => uint256) public dao_delegations_value;
    mapping(address => address[]) public user_delegations;
    mapping(address => mapping(address => uint256)) public user_delegations_value;
    mapping(address => uint256) public my_tokens;
    mapping(address => uint256) public debt_tokens;
    uint256 public total_my_tokens_given;

    /**
     * @dev Initializes the SUToken contract
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param owner The address of the token contract owner
     */
    constructor(string memory name, string memory symbol, address owner)
        ERC20(name, symbol)
    {
        _mint(owner, 1000 * 10 ** decimals());
        proposal_num = 0;
    }

    /**
     * @dev Mints new tokens and adds them to the specified address
     * @param to The address to which the tokens will be minted
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public override onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Assigns the DAO contract address to the token
     * @param in_dao The address of the DAO contract
     */
    function assignDAO(address in_dao) public override onlyOwner {
        myDAO = in_dao;
    }
        /**
     * @dev Transfers tokens from the caller's account to a specified address
     * @param to The address to which the tokens will be transferred
     * @param amount The amount of tokens to transfer
     * @return A boolean indicating whether the transfer was successful or not
     */
    function transfer(address to, uint256 amount) public override (ERC20, ISUToken) returns (bool) {
        address owner = _msgSender();
        require(amount <= balanceOf(owner), "not enough in balance ");
        require(amount <= my_tokens[owner], "cant send debt tokens, you do not have enough tokens ");
        for (uint i = 0; i < proposal_num; i++) {
            if (transferLock[owner][i] == true) {
                require(false, "have active voting");
            }
        }
        _transfer(owner, to, amount);
        my_tokens[owner] -= amount;
        debt_tokens[to] += amount;
        user_delegations_value[owner][to] += amount;
        user_delegations[owner].push(to);
        return true;
    }

    /**
     * @dev Transfers tokens from the DAO account to a specified address
     * @param to The address to which the tokens will be transferred
     * @param amount The amount of tokens to transfer
     * @return A boolean indicating whether the transfer was successful or not
     */
    function transferDAO(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        require(owner == myDAO);
        _transfer(owner, to, amount);
        my_tokens[to] += amount;
        dao_delegations_value[to] += amount;
        dao_delegations.push(to);
        total_my_tokens_given += amount;
        return true;
    }


    /**
     * @dev Transfers a specific amount of tokens from a temporary holder to the original sender
     * @param from The address that temporarily holds the tokens
     * @param to The original sender of the tokens
     * @param amount The amount of tokens to transfer back
     * @return A boolean indicating whether the transfer was successful or not
     */
    function delegation_single_getback_amount(address from, address to, uint256 amount) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this), "sender is not dao or token");
        for (uint i = 0; i < proposal_num; i++) {
            if (transferLock[from][i] == true) {
                transferLock[to][i] = true;
            }
        }
        _transfer(from, to, amount);
        debt_tokens[from] -= amount;
        my_tokens[to] += amount;
        user_delegations_value[to][from] -= amount;
        if (user_delegations_value[to][from] == 0) {
            for (uint i = 0; i < user_delegations[to].length; i++) {
                if (user_delegations[to][i] == from) {
                    user_delegations[to][i] = user_delegations[to][user_delegations[to].length - 1];
                    user_delegations[to].pop();
                    break;
                }
            }
        }
        return true;
    }

    /**
     * @dev Transfers all delegated tokens from a temporary holder to the original sender
     * @param from The address that temporarily holds the tokens
     * @param to The original sender of the tokens
     * @return A boolean indicating whether the transfer was successful or not
     */
    function delegation_single_getback_all(address from, address to) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this), "sender is not dao or token");
        delegation_single_getback_amount(from, to, user_delegations_value[to][from]);
        return true;
    }

    /**
     * @dev Transfers all delegated tokens from multiple temporary holders to the original sender
     * @param to The original sender of the tokens
     * @return A boolean indicating whether the transfer was successful or not
     */
    function delagation_multiple_getback_all(address to) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this), "sender is not dao or token");
        for (uint i = 0; i < user_delegations[to].length; i++) {
            address delegate = user_delegations[to][i];
            uint256 amount = user_delegations_value[to][delegate];
            _transfer(delegate, to, amount);
            debt_tokens[delegate] -= amount;
            my_tokens[to] += amount;
            user_delegations_value[to][delegate] = 0;
        }
        delete user_delegations[to];
        user_delegations[to] = new address[](0);
        return true;
    }

    /**
     * @dev Clawbacks a single token holder's delegated tokens and transfers them back to the DAO
     * @param to The address of the token holder
     * @return A boolean indicating whether the clawback was successful or not
     */
    function clawback_single(address to) public override returns (bool){
        require(_msgSender() == myDAO || _msgSender() == address(this), "sender is not dao or token");
        delagation_multiple_getback_all(to);
        require(my_tokens[to] == dao_delegations_value[to], "something went very wrong");
        if (my_tokens[to] == 0) {
            return true;
        }
        // If the user has enough transferable tokens in their wallet
        total_my_tokens_given -= my_tokens[to];
        _transfer(to, myDAO, my_tokens[to]);
        dao_delegations_value[to] = 0;
        my_tokens[to] = 0;
        return true;
    }

    /**
     * @dev Clawbacks all delegated tokens from all token holders and transfers them back to the DAO
     * @return A boolean indicating whether the clawback was successful or not
     */
    function clawback_all() public override returns (bool){
        require(_msgSender() == myDAO, "sender is not dao");
        for (uint i = 0; i < dao_delegations.length; i++) {
            clawback_single(dao_delegations[i]);
        }
        return true;
    }

    /**
     * @dev Updates the number of active proposals in the DAO
     * @param proposals The new number of proposals
     */
    function update_proposal_num(uint proposals) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        proposal_num = proposals;
    }

    /**
     * @dev Updates the active voter lock for a specific proposal and sender
     * @param proposal The index of the proposal
     * @param sender The address of the sender
     */
    function update_active_voter_lock_on(uint proposal, address sender) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        transferLock[sender][proposal] = true;
    }

    /**
     * @dev Updates the active voter lock for a specific proposal and sender
     * @param proposal The index of the proposal
     * @param sender The address of the sender
     */
    function update_active_voter_lock_off(uint proposal, address sender) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        transferLock[sender][proposal] = false;
    }

    /**
     * @dev Increases the allowance of a spender
     * @param spender The address of the spender
     * @param addedValue The amount to increase the allowance by
     * @return A boolean indicating whether the allowance was increased successfully or not
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual override (ISUToken, ERC20) returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Transfers ownership of the contract to a new owner
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Retrieves the amount of debt tokens held by an address
     * @param adr The address to query
     * @return The amount of debt tokens held by the address
     */
    function getDebtToken(address adr) public override view returns (uint256) {
        return debt_tokens[adr];
    }

    /**
     * @dev Retrieves the amount of my tokens held by an address
     * @param adr The address to query
     * @return The amount of my tokens held by the address
     */
    function getMyToken(address adr) public override view returns (uint256) {
        return my_tokens[adr];
    }

}
