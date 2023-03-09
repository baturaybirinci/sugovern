// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
//import "./DAO.sol";
import "./newDAO1.sol";
import "./itoken.sol";
import "./icreator.sol";

contract DAOFactory {
    address public top_dao;
    mapping(MyDAO => MyDAO[]) public parent_child_daos;
    mapping(MyDAO => uint) public num_children;
    //MyDAO[] public _child_daos;
    //address[] public dao_creators_top;
    mapping(address => bool) public is_a_dao_creator;
    mapping(MyDAO => ISUToken) public dao_tokens_yk;
    mapping(MyDAO => ISUToken) public dao_tokens_voter;
    mapping(MyDAO => address) public dao_first_yk; // for an edge case 
    mapping(ISUToken => address) public token_first_yk;
    mapping(MyDAO => bool) public dao_exists;
    mapping (MyDAO => MyDAO) public child_parent;
    //event num_contracts(uint num);
    mapping(uint256 => MyDAO) public all_daos;
    uint256 public next_dao_id; 
    icreator my_creator;
    address private yk_token_address;
    address private voter_token_address;
    
    constructor(address myCreator) {
        my_creator = icreator(myCreator);
        is_a_dao_creator[msg.sender] = true;   
        next_dao_id = 0;
    }

    //so first the dao and the token will be created, factory will have the tokens and dao will have the allowance to use 
    //these tokens, the yk will be able to withdraw, send and deposit yk_tokens
    function createDAOTop( string memory dao_name,  string memory dao_description, string memory yk_token_name, string memory yk_token_symbol, string memory voter_token_name, string memory voter_token_symbol) public {
        require(is_a_dao_creator[msg.sender] == true, 'Not added as a DAO Creator');
        //line below mints 1000 tokens to this factory, also makes factory the owner of these tokens
 
        //ISUToken yk_token = new ISUToken(yk_token_name, yk_token_symbol, address(this));
        //ISUToken voter_token = new ISUToken(voter_token_name, voter_token_symbol, address(this));

        (yk_token_address, voter_token_address) = my_creator.createToken(yk_token_name,yk_token_symbol,  voter_token_name,  voter_token_symbol);

        ISUToken yk_token = ISUToken(yk_token_address);
        ISUToken voter_token = ISUToken(voter_token_address);
        MyDAO c = new MyDAO(dao_name, dao_description,next_dao_id, msg.sender, yk_token, voter_token, this);
        //token.mint(address(c), 1000*10**18);
        //with this function my dao can use the tokens my factory has however it wishes, it is currently only 1000, can add mint later
        yk_token.increaseAllowance(address(c), 1000* 10**18);
        yk_token.increaseAllowance(address(this), 1000* 10**18);
        voter_token.increaseAllowance(address(c), 1000* 10**18);
        voter_token.increaseAllowance(address(this), 1000* 10**18);
        yk_token.assignDAO( address(c));
        voter_token.assignDAO( address(c));
        //we save which dao has which yk tokens and which voter tokens

        dao_tokens_yk[c] = yk_token;
        dao_tokens_voter[c] = voter_token;
        dao_first_yk[c] = msg.sender;
        token_first_yk[yk_token] = msg.sender;
        top_dao = address(c);
        dao_exists[c] = true;

        //tokens are minted to factory right, we are sending them to dao so they can utilize it.
        voter_token.transferFrom(address(this), address(c), 1000 * 10**18);
        yk_token.transferFrom(address(this), address(c), (1000 * 10 ** 18));
        all_daos[next_dao_id] = c;



        next_dao_id += 1;
    }


    function createChildDAO( MyDAO parent, string memory dao_name,  string memory dao_description, string memory yk_token_name, string memory yk_token_symbol, string memory voter_token_name, string memory voter_token_symbol) public {
        require(parent.has_yk_priviliges(msg.sender) == true, 'Not a YK of parent DAO');
        //line below mints 1000 tokens to this factory, also makes factory the owner of these tokens
 

        (yk_token_address, voter_token_address) = my_creator.createToken(yk_token_name,yk_token_symbol,  voter_token_name,  voter_token_symbol);
        ISUToken yk_token = ISUToken(yk_token_address);
        ISUToken voter_token = ISUToken(voter_token_address);
        MyDAO c = new MyDAO(dao_name, dao_description,next_dao_id, msg.sender, yk_token, voter_token, this);
        //token.mint(address(c), 1000*10**18);
        //with this function my dao can use the tokens my factory has however it wishes, it is currently only 1000, can add mint later
        yk_token.increaseAllowance(address(c), 1000* 10**18);
        yk_token.increaseAllowance(address(this), 1000* 10**18);
        voter_token.increaseAllowance(address(c), 1000* 10**18);
        voter_token.increaseAllowance(address(this), 1000* 10**18);
        //check if assignDAO works with interface
        yk_token.assignDAO( address(c));
        voter_token.assignDAO( address(c));
        //we save which dao has which yk tokens and which voter tokens

        dao_tokens_yk[c] = yk_token;
        dao_tokens_voter[c] = voter_token;
        dao_first_yk[c] = msg.sender;
        token_first_yk[yk_token] = msg.sender;
        //top_dao = address(c);
        dao_exists[c] = true;
        parent_child_daos[parent].push(c);
        num_children[parent] += 1;
        child_parent[c] = parent;
        
        

        //tokens are minted to factory right, we are sending them to dao so they can utilize it.
        voter_token.transferFrom(address(this), address(c), 1000 * 10**18);
        yk_token.transferFrom(address(this), address(c), (1000 * 10 ** 18));




        all_daos[next_dao_id] = c;
        next_dao_id += 1;
    }

    function mint_dao_yk(MyDAO to_be_minted, uint amount, address sender) public {
        require(to_be_minted.has_yk_priviliges(sender), "Not YK of selected DAO");
        //make sure the one who sends this is dao
        require(msg.sender == address(to_be_minted), "Don't even try");
        dao_tokens_yk[to_be_minted].mint(address(to_be_minted), amount*10**18);
    }

    function mint_dao_voter(MyDAO to_be_minted, uint amount, address sender) public {
        require(to_be_minted.has_yk_priviliges(sender), "Not YK of selected DAO");
        //make sure the one who sends this is dao
        require(msg.sender == address(to_be_minted), "Don't even try");
        dao_tokens_voter[to_be_minted].mint(address(to_be_minted), amount*10**18);
    }

   


    function addCreator(address input_creator) public
    {
        is_a_dao_creator[input_creator] = true;
    }
    function getParentDAO(MyDAO mydao)  public view returns (MyDAO){
        return child_parent[mydao];

    }
    function getCurrentDAO(uint256 id)  public view returns (MyDAO){
        return all_daos[id];

    }



    function delete_DAO(MyDAO to_be_deleted, address sender) public {
        require(to_be_deleted.has_yk_priviliges(sender) || msg.sender == address(this) || msg.sender == address(to_be_deleted), "Not YK of selected DAO");
        //make sure the one who sends this is dao
        require(msg.sender == address(to_be_deleted), "Don't even try");


        num_children[child_parent[to_be_deleted]] -= 1;
        for (uint i = 0 ; i < parent_child_daos[to_be_deleted].length; i++){
            parent_child_daos[to_be_deleted][i].delete_this_dao();            
        }
        for ( uint i = 0; i < parent_child_daos[child_parent[to_be_deleted]].length; i++){
            if( parent_child_daos[child_parent[to_be_deleted]][i]== to_be_deleted){
                //user_delegations[to][i];
                //string element = myArray[index];
                parent_child_daos[child_parent[to_be_deleted]][i] = parent_child_daos[child_parent[to_be_deleted]][parent_child_daos[child_parent[to_be_deleted]].length - 1];
                parent_child_daos[child_parent[to_be_deleted]].pop();

                
            }

        }        
        dao_exists[to_be_deleted] = false;
        MyDAO c;
        all_daos[ to_be_deleted.getDaoid()] = c;
    }

}