// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

interface icreator {
    //create tokens, and transfer ownership to the factory
    function createToken( string memory yk_token_name, string memory yk_token_symbol, string memory voter_token_name, string memory voter_token_symbo) external returns (address, address);

}