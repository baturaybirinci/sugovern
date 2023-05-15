/**
 * @title Creator Contract
 * @dev This contract is responsible for creating tokens and transferring ownership to the factory.
 */

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

//import "./DAO.sol";
import "./token.sol";
import "./icreator.sol";

contract creator is icreator {

    /**
     * @dev Creates two tokens and transfers ownership to the factory.
     * @param yk_token_name The name of the first token.
     * @param yk_token_symbol The symbol of the first token.
     * @param voter_token_name The name of the second token.
     * @param voter_token_symbol The symbol of the second token.
     * @return The addresses of the created tokens.
     */
    function createToken(string memory yk_token_name, string memory yk_token_symbol, string memory voter_token_name, string memory voter_token_symbol ) external override returns (address, address) {
        // Get the address of the factory
        address my_factory = msg.sender;

        // Create the first token
        SUToken yk_token = new SUToken(yk_token_name, yk_token_symbol, my_factory);

        // Create the second token
        SUToken voter_token = new SUToken(voter_token_name, voter_token_symbol, my_factory);

        // Transfer ownership of the first token to the factory
        yk_token.transferOwnership(my_factory);

        // Transfer ownership of the second token to the factory
        voter_token.transferOwnership(my_factory);

        // Return the addresses of the created tokens
        return (address(yk_token), address(voter_token));
    }

}
