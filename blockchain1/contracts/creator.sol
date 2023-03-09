// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
//import "./DAO.sol";
import "./token.sol";
import "./icreator.sol";


contract creator is icreator {


    //create tokens, and transfer ownership to the factory
    function createToken(string memory yk_token_name, string memory yk_token_symbol, string memory voter_token_name, string memory voter_token_symbol ) external override returns (address, address){
        address my_factory = msg.sender;
        SUToken yk_token = new SUToken(yk_token_name, yk_token_symbol, my_factory);
        SUToken voter_token = new SUToken(voter_token_name, voter_token_symbol, my_factory);
        yk_token.transferOwnership(my_factory);
        voter_token.transferOwnership(my_factory);
        return (address(yk_token), address(voter_token));
    }

}