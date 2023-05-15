// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
//import "./DAO.sol";
import "./newDAO1.sol";
import "./itoken.sol";
import "./icreator.sol";

/**
 * @title DAOFactory
 * @dev A contract for creating and managing DAOs (Decentralized Autonomous Organizations)
 */
contract DAOFactory {
    address public top_dao; // Address of the top-level DAO
    mapping(MyDAO => MyDAO[]) public parent_child_daos; // Maps each parent DAO to its child DAOs
    mapping(MyDAO => uint) public num_children; // Stores the number of child DAOs for each parent DAO
    mapping(address => bool) public is_a_dao_creator; // Maps addresses of DAO creators to a boolean indicating whether they are a DAO creator
    mapping(MyDAO => ISUToken) public dao_tokens_yk; // Maps each DAO to its associated YK token contract
    mapping(MyDAO => ISUToken) public dao_tokens_voter; // Maps each DAO to its associated voter token contract
    mapping(MyDAO => address) public dao_first_yk; // Maps each DAO to the address of the first YK token holder (used in an edge case)
    mapping(ISUToken => address) public token_first_yk; // Maps each YK token contract to the address of the first YK token holder
    mapping(MyDAO => bool) public dao_exists; // Maps each DAO to a boolean indicating whether the DAO exists
    mapping(MyDAO => MyDAO) public child_parent; // Maps each child DAO to its parent DAO
    mapping(uint256 => MyDAO) public all_daos; // Maps each DAO ID to its corresponding DAO contract
    uint256 public next_dao_id; // ID to be assigned to the next created DAO
    icreator my_creator; // Address of the token creator contract
    address private yk_token_address; // Address of the YK token contract
    address private voter_token_address; // Address of the voter token contract

    /**
     * @dev Initializes the DAOFactory contract
     * @param myCreator Address of the token creator contract
     */
    constructor(address myCreator) {
        my_creator = icreator(myCreator);
        is_a_dao_creator[msg.sender] = true;
        next_dao_id = 0;
    }

    /**
     * @dev Creates a new top-level DAO
     * @param dao_name Name of the DAO
     * @param dao_description Description of the DAO
     * @param yk_token_name Name of the YK token
     * @param yk_token_symbol Symbol of the YK token
     * @param voter_token_name Name of the voter token
     * @param voter_token_symbol Symbol of the voter token
     */
    function createDAOTop(
        string memory dao_name,
        string memory dao_description,
        string memory yk_token_name,
        string memory yk_token_symbol,
        string memory voter_token_name,
        string memory voter_token_symbol
    ) public {
        require(
            is_a_dao_creator[msg.sender] == true,
            "Not added as a DAO Creator"
        );

        // Create YK and voter token contracts using the token creator contract
        (yk_token_address, voter_token_address) = my_creator.createToken(
            yk_token_name,
            yk_token_symbol,
            voter_token_name,
            voter_token_symbol
        );

        // Create instances of YK and voter token contracts
        ISUToken yk_token = ISUToken(yk_token_address);
        ISUToken voter_token = ISUToken(voter_token_address);

        // Create a new top-level DAO contract
        MyDAO c = new MyDAO(
            dao_name,
            dao_description,
            next_dao_id,
            msg.sender,
            yk_token,
            voter_token,
            this
        );

        // Increase the allowance of tokens to the DAO contract
        yk_token.increaseAllowance(address(c), 1000 * 10 ** 18);
        yk_token.increaseAllowance(address(this), 1000 * 10 ** 18);
        voter_token.increaseAllowance(address(c), 1000 * 10 ** 18);
        voter_token.increaseAllowance(address(this), 1000 * 10 ** 18);

        // Assign the DAO to use the YK and voter tokens
        yk_token.assignDAO(address(c));
        voter_token.assignDAO(address(c));

        // Save the associations between the DAO and its tokens
        dao_tokens_yk[c] = yk_token;
        dao_tokens_voter[c] = voter_token;
        dao_first_yk[c] = msg.sender;
        token_first_yk[yk_token] = msg.sender;

        top_dao = address(c); // Set the top-level DAO address
        dao_exists[c] = true; // Mark the DAO as existing

        // Transfer tokens from the factory to the DAO contract
        voter_token.transferFrom(address(this), address(c), 1000 * 10 ** 18);
        yk_token.transferFrom(address(this), address(c), 1000 * 10 ** 18);

        all_daos[next_dao_id] = c; // Store the DAO contract
        next_dao_id += 1; // Increment the DAO ID for the next DAO creation
    }

    /**
     * @dev Creates a new child DAO under a parent DAO
     * @param parent Parent DAO contract address
     * @param dao_name Name of the DAO
     * @param dao_description Description of the DAO
     * @param yk_token_name Name of the YK token
     * @param yk_token_symbol Symbol of the YK token
     * @param voter_token_name Name of the voter token
     * @param voter_token_symbol Symbol of the voter token
     */
    function createChildDAO(
        MyDAO parent,
        string memory dao_name,
        string memory dao_description,
        string memory yk_token_name,
        string memory yk_token_symbol,
        string memory voter_token_name,
        string memory voter_token_symbol
    ) public {
        require(
            parent.has_yk_priviliges(msg.sender) == true,
            "Not a YK of parent DAO"
        );

        // Create YK and voter token contracts using the token creator contract
        (yk_token_address, voter_token_address) = my_creator.createToken(
            yk_token_name,
            yk_token_symbol,
            voter_token_name,
            voter_token_symbol
        );

        // Create instances of YK and voter token contracts
        ISUToken yk_token = ISUToken(yk_token_address);
        ISUToken voter_token = ISUToken(voter_token_address);

        // Create a new child DAO contract
        MyDAO c = new MyDAO(
            dao_name,
            dao_description,
            next_dao_id,
            msg.sender,
            yk_token,
            voter_token,
            this
        );

        // Increase the allowance of tokens to the DAO contract
        yk_token.increaseAllowance(address(c), 1000 * 10 ** 18);
        yk_token.increaseAllowance(address(this), 1000 * 10 ** 18);
        voter_token.increaseAllowance(address(c), 1000 * 10 ** 18);
        voter_token.increaseAllowance(address(this), 1000 * 10 ** 18);

        // Assign the DAO to use the YK and voter tokens
        yk_token.assignDAO(address(c));
        voter_token.assignDAO(address(c));

        // Save the associations between the DAO and its tokens
        dao_tokens_yk[c] = yk_token;
        dao_tokens_voter[c] = voter_token;
        dao_first_yk[c] = msg.sender;
        token_first_yk[yk_token] = msg.sender;

        dao_exists[c] = true; // Mark the child DAO as existing
        parent_child_daos[parent].push(c); // Add the child DAO to the parent's list
        num_children[parent] += 1; // Increment the number of children for the parent DAO
        child_parent[c] = parent; // Set the parent DAO for the child

        // Transfer tokens from the factory to the child DAO contract
        voter_token.transferFrom(address(this), address(c), 1000 * 10 ** 18);
        yk_token.transferFrom(address(this), address(c), 1000 * 10 ** 18);

        all_daos[next_dao_id] = c; // Store the child DAO contract
        next_dao_id += 1; // Increment the DAO ID for the next DAO creation
    }

    function mint_dao_yk(
        MyDAO to_be_minted,
        uint amount,
        address sender
    ) public {
        require(
            to_be_minted.has_yk_priviliges(sender),
            "Not YK of selected DAO"
        );
        //make sure the one who sends this is dao
        require(msg.sender == address(to_be_minted), "Don't even try");
        dao_tokens_yk[to_be_minted].mint(
            address(to_be_minted),
            amount * 10 ** 18
        );
    }

    function mint_dao_voter(
        MyDAO to_be_minted,
        uint amount,
        address sender
    ) public {
        require(
            to_be_minted.has_yk_priviliges(sender),
            "Not YK of selected DAO"
        );
        require(msg.sender == address(to_be_minted), "Don't even try");
        dao_tokens_voter[to_be_minted].mint(
            address(to_be_minted),
            amount * 10 ** 18
        );
    }

    /**
     * @dev Adds a new address to the list of DAO creators
     * @param input_creator The address to be added as a DAO creator
     */
    function addCreator(address input_creator) public {
        is_a_dao_creator[input_creator] = true;
    }

    /**
     * @dev Retrieves the parent DAO of a given child DAO
     * @param mydao The child DAO contract
     * @return The parent DAO contract
     */
    function getParentDAO(MyDAO mydao) public view returns (MyDAO) {
        return child_parent[mydao];
    }

    /**
     * @dev Retrieves the DAO contract based on its ID
     * @param id The ID of the DAO
     * @return The DAO contract
     */
    function getCurrentDAO(uint256 id) public view returns (MyDAO) {
        return all_daos[id];
    }

    /**
     * @dev Deletes a DAO and its child DAOs recursively
     * @param to_be_deleted The DAO contract to be deleted
     * @param sender The address of the sender requesting the deletion
     */
    function delete_DAO(MyDAO to_be_deleted, address sender) public {
        require(
            to_be_deleted.has_yk_priviliges(sender) ||
                msg.sender == address(this) ||
                msg.sender == address(to_be_deleted),
            "Not YK of selected DAO"
        );
        require(msg.sender == address(to_be_deleted), "Don't even try");

        // Decrement the number of children for the parent DAO
        num_children[child_parent[to_be_deleted]] -= 1;

        // Delete all child DAOs recursively
        for (uint256 i = 0; i < parent_child_daos[to_be_deleted].length; i++) {
            parent_child_daos[to_be_deleted][i].delete_this_dao();
        }

        // Remove the DAO from the parent's child DAO list
        for (
            uint256 i = 0;
            i < parent_child_daos[child_parent[to_be_deleted]].length;
            i++
        ) {
            if (
                parent_child_daos[child_parent[to_be_deleted]][i] ==
                to_be_deleted
            ) {
                parent_child_daos[child_parent[to_be_deleted]][
                    i
                ] = parent_child_daos[child_parent[to_be_deleted]][
                    parent_child_daos[child_parent[to_be_deleted]].length - 1
                ];
                parent_child_daos[child_parent[to_be_deleted]].pop();
            }
        }

        // Mark the DAO as not existing
        dao_exists[to_be_deleted] = false;
        MyDAO c;
        all_daos[to_be_deleted.getDaoid()] = c;
    }
}
