// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISUToken is IERC20{

    //mapping (uint => mapping(address => bool)) public proposalid_to_address_cantusetoken;
    //uint256 public proposal_num;
    //address public myDAO;
    //mapping (address => mapping(uint256 => bool)) public transferLock;
    
    function mint(address to, uint256 amount) external ;
    function assignDAO(address in_dao) external ;
    function transfer(address to, uint256 amount) external override returns (bool) ;
    function transferDAO(address to, uint256 amount) external returns (bool) ;
    function update_proposal_num(uint proposals) external ;
    function update_active_voter_lock_on(uint proposal, address sender) external ;   
    function update_active_voter_lock_off(uint proposal, address sender) external ; 
    function increaseAllowance(address spender, uint256 addedValue) external  returns (bool);
    
    function delegation_single_getback_amount(address from, address to, uint256 amount) external returns (bool);
    function delegation_single_getback_all(address from, address to ) external  returns (bool);
    function delagation_multiple_getback_all(address to) external returns (bool);
    function clawback_single(address to) external returns (bool);
    function clawback_all() external returns (bool);

    function getDebtToken(address adr) external view returns (uint256);
    function getMyToken(address adr) external view returns (uint256);

    
    //constructor(string memory name, string memory symbol, address owner) external  ;


    //soyle oncelikle factory de tokenime dao adresim giriliyor, sonra ben yk olarak birine token gonderirsem bir sorun yok, ama normal 
    //bir sekilde transfer ile gonderirsem butun oyladigim proposallarda digerininkileri aliyorum, yani onun oy verdiklerine oy veremiyorum ve bu.
    //sirf true olanlarda gecerli yani bos bir adresten transferlede duzeltilemiyor, sonrasinda oy veriyorum oy verirken bu kisininki
    //oyle tutulmus mu diye  checkleniyor. sonrasinda direk ona gore geri donus aliyorum.


    //function isContract(address addr) view private returns (bool isContract) {    return addr.code.length > 0; }

}