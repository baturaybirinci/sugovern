// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./itoken.sol";


contract SUToken is ISUToken, ERC20, Ownable {
    uint256 public proposal_num;
    address public myDAO;
    mapping (address => mapping(uint256 => bool)) public transferLock;
    address[] public dao_delegations;
    mapping (address => uint256 ) public dao_delegations_value;
    mapping (address => address[]) public user_delegations;
    mapping (address=> mapping(address=> uint256)) public user_delegations_value;
    //my_tokens are sendable tokens while debt tokens say in your wallet until they are called back.
    mapping (address => uint256) public my_tokens;
    mapping (address => uint256) public debt_tokens;
    //all tokens the dao itself has given.
    uint256 public total_my_tokens_given;


    constructor(string memory name, string memory symbol, address owner) ERC20(name, symbol) {
        _mint(owner, 1000 * 10 ** decimals());
        proposal_num = 0;
    }

    function mint(address to, uint256 amount) public override onlyOwner {
        //bu function cagirilan, _mint kendisinde iste boylece degisitrebliyorum anladin heralde
        _mint(to, amount);
    }

    function assignDAO(address in_dao) public override onlyOwner{
        myDAO = in_dao;
    }


    function transfer(address to, uint256 amount) public override (ERC20, ISUToken) returns (bool) {
        address owner = _msgSender();
        require(amount <= balanceOf(owner), "not enough in balance ");
        require(amount <= my_tokens[owner], "cant send debt tokens, you do not have enough tokens ");
        for (uint i = 0; i < proposal_num; i ++ ){
            if(transferLock[owner][i] == true){
                require(false , "have active voting");
            }
        }
        _transfer(owner, to, amount);
        my_tokens[owner] -= amount;
        debt_tokens[to] += amount;
        user_delegations_value[owner][to] += amount;
        user_delegations[owner].push(to);
        return true;
    }

    //this is the function that the dao will call to give tokens to a user
    function transferDAO(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        require(owner == myDAO);
        //when dao sends it this is not the case
        _transfer(owner, to, amount);
        my_tokens[to] += amount;
        dao_delegations_value[to] += amount;
        dao_delegations.push(to);
        total_my_tokens_given += amount;
        return true;
    }

    //from = b tokeni gecici olarak alan kisi to = a tokeni basta gonderen kisi
    function delegation_single_getback_amount(address from, address to, uint256 amount) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this) , "sender is not dao or token");
        for (uint i = 0; i < proposal_num; i ++ ){
            if(transferLock[from][i] == true){
                transferLock[to][i] = true;
            }
        }
        _transfer(from, to, amount);
        debt_tokens[from] -= amount;
        my_tokens[to] += amount;
        user_delegations_value[to][from] -= amount;
        if(user_delegations_value[to][from] == 0){
            for ( uint i = 0; i < user_delegations[to].length; i++){
                if(user_delegations[to][i] == from){
                    user_delegations[to][i] = user_delegations[to][user_delegations[to].length - 1];
                    user_delegations[to].pop();
                    break;
                }
            }
        }
        return true;
    }
    //from = b tokeni gecici olarak alan kisi to = a tokeni basta gonderen kisi
    function delegation_single_getback_all(address from, address to ) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this) , "sender is not dao or token");
        delegation_single_getback_amount( from,  to,  user_delegations_value[to][from]);
        return true;
    }

    //this will allow the user to get all delegated tokens back
    function delagation_multiple_getback_all(address to) public override returns (bool) {
        require(_msgSender() == myDAO || _msgSender() == address(this) , "sender is not dao or token");
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

    //to is actually from
    function clawback_single(address to) public override returns (bool){
        require(_msgSender() == myDAO || _msgSender() == address(this) , "sender is not dao or token");
        delagation_multiple_getback_all(to);
        require(my_tokens[to] == dao_delegations_value[to] , "something went very wrong ");
        if(my_tokens[to] == 0){
            return true;
        }
        //if the user has enough transfarable tokens in their wallet

        total_my_tokens_given -= my_tokens[to];
        _transfer(to, myDAO, my_tokens[to]);
        dao_delegations_value[to] = 0;
        my_tokens[to] = 0;
        return true;
    }

    function clawback_all() public override returns (bool){
        require(_msgSender() == myDAO, "sender is not dao");
        for (uint i = 0; i < dao_delegations.length; i ++ ){
            clawback_single(dao_delegations[i]);
        }
        return true;
    }

    function update_proposal_num(uint proposals) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        proposal_num = proposals;
    }

    function update_active_voter_lock_on(uint proposal, address sender) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        transferLock[sender][proposal] = true;
    }

    function update_active_voter_lock_off(uint proposal, address sender) public override {
        address owner = msg.sender;
        require(owner == myDAO);
        transferLock[sender][proposal] = false;
    }
    function increaseAllowance(address spender, uint256 addedValue) public virtual override (ISUToken, ERC20) returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function getDebtToken(address adr) public override view returns (uint256) {
        return debt_tokens[adr];
    }
    function getMyToken(address adr) public override view returns (uint256) {
        return my_tokens[adr];
    }


    //soyle oncelikle factory de tokenime dao adresim giriliyor, sonra ben yk olarak birine token gonderirsem bir sorun yok, ama normal
    //bir sekilde transfer ile gonderirsem butun oyladigim proposallarda digerininkileri aliyorum, yani onun oy verdiklerine oy veremiyorum ve bu.
    //sirf true olanlarda gecerli yani bos bir adresten transferlede duzeltilemiyor, sonrasinda oy veriyorum oy verirken bu kisininki
    //oyle tutulmus mu diye  checkleniyor. sonrasinda direk ona gore geri donus aliyorum.


    //function isContract(address addr) view private returns (bool isContract) {    return addr.code.length > 0; }

}
