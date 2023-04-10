// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./itoken.sol";
import "./newFactory1.sol";


contract MyDAO {
    string public dao_name;
    string public dao_description;
    string[] public debug_array;
    string public imageUrl;
    uint256 dao_id;
    enum VotingOptions { Yes, No }
    enum Status     { Accepted, Rejected, Pending }
    

    address public test;

    struct Proposal {
        uint256 id;
        address author;
        string name;
        string proposal_description;
        uint256 createdAt;
        string[] options;
        uint256[] options_num;
        Status status;
        uint256 power;
        string proposal_info_type;

    }   
    

    function stringsEquals(string memory s1, string memory s2) private pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    DAOFactory factory;

    // store all proposals
    mapping(uint => Proposal) public proposals;    
    //to print out proposals
    event proposal_info(uint256 id, address author, string name,string proposal_description, string[] options, uint256[] num_options, uint256 power, string proposal_info_type);
    // who already votes for who and to avoid vote twice
    mapping(address => mapping(uint => bool)) public votes;
    mapping(address => mapping(uint => bool)) public tokens_not_refunded;
    mapping(address => mapping(uint => uint)) public token_amount_to_be_refunded;
    // one share for governance tokens
    mapping(address => uint256) public voter_shares_to_be_given;
    mapping(address => uint256) public yk_shares_to_be_given;

    // the IERC20 allow us to use avax like our governance token.
    ISUToken public voter_token;
    ISUToken public yk_token;
    // the user need minimum 25 AVAX to create a proposal.
    uint constant CREATE_PROPOSAL_MIN_SHARE = 1 * 10 ** 18;
    uint constant VOTING_PERIOD = 7 days;
    uint public nextProposalId;
    
    mapping(address => bool) transferLock;

    constructor(string memory _dao_name, string memory _imageUrl, string memory _dao_description,uint _dao_id, address first_yk, ISUToken yk_token_in, ISUToken voter_token_in, DAOFactory _factory) {
        factory = _factory;
        dao_name = _dao_name;
        dao_id=_dao_id;
        dao_description = _dao_description;
        yk_token = yk_token_in; // AVAX address
        voter_token = voter_token_in;
        imageUrl = _imageUrl;
        //maybe mintabele amount can be taken as an input and 1000 yerine konabilir
        yk_shares_to_be_given[first_yk] += (1 * 10 ** 18);
        
        voter_shares_to_be_given[first_yk] += (1 * 10 ** 18);

    }

    function mint_from_DAO_yk_token(uint _amount) internal {
        factory.mint_dao_yk(this, _amount, msg.sender);
    }

    function mint_from_DAO_voter_token(uint _amount) internal {
        factory.mint_dao_voter(this, _amount, msg.sender);
    }


    function iterate_proposals() public //ama sanirim boyle degilde teker teker yapmamiz gerekcek cok pahali olabilir obur turlu
    {
        for(uint i=0;i<nextProposalId;i++) //degistirmedim cunku artik sirf bunu kullaniriz yani
        {
            if(proposals[i].status != Status.Pending){
                voter_token.update_active_voter_lock_off(i, msg.sender);
            }

            emit proposal_info(proposals[i].id, proposals[i].author, proposals[i].name,proposals[i].proposal_description, proposals[i].options, proposals[i].options_num, proposals[i].power, proposals[i].proposal_info_type);

        }
        
    }        

    function accept_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Accepted;
    }

    function reject_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Rejected;
    
    }    

    function pending_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Pending;
    }       

        


    function withdraw_voter_tokens(uint _amount) external {
        require(voter_shares_to_be_given[msg.sender] >= _amount*10**18, 'Not enough shares');
        voter_shares_to_be_given[msg.sender] -= (_amount * 10 ** 18);
        voter_token.transferDAO(msg.sender, (_amount * 10 ** 18));
        mint_from_DAO_voter_token(_amount);
    }    



    


    function withdraw_yk_tokens(uint _amount) external {
        require(yk_shares_to_be_given[msg.sender] >= _amount, 'Not enough shares');
        yk_shares_to_be_given[msg.sender] -= (_amount * 10 ** 18);
        yk_token.transferDAO(msg.sender, (_amount * 10 ** 18));
        mint_from_DAO_yk_token(_amount);

    }    
    
    function send_yk_tokens_to_address_yk(address yk_candidate, uint _amount) external {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        //yk_shares[msg.sender] -= (_amount * 10 ** 18);
        //totalShares -= (_amount * 10 ** 18);
        //total_yk_shares -= (_amount * 10 ** 18);
        //neden olmuyor bu
        //yk_token.transfer(yk_candidate, _amount * 18 **18);
        yk_shares_to_be_given[yk_candidate] += _amount * 10 ** 18;
        //yk_token.transfer(yk_candidate, (_amount * 10 ** 18));
    } 

    function send_yk_tokens_to_address_yk_directly(address yk_candidate, uint _amount) public {
        require(has_yk_priviliges(msg.sender) , 'Not a YK');
        //yk_shares[msg.sender] -= (_amount * 10 ** 18);
        //totalShares -= (_amount * 10 ** 18);
        //total_yk_shares -= (_amount * 10 ** 18);
        //neden olmuyor bu
        //yk_token.transfer(yk_candidate, _amount * 18 **18);
        //yk_shares_to_be_given[yk_candidate] += _amount * 10 ** 18;
        //yk_token.transfer(yk_candidate, (_amount * 10 ** 18));
        yk_token.transferDAO(yk_candidate, (_amount * 10 ** 18));
        mint_from_DAO_yk_token(_amount);
    } 
 
 
    function send_voter_tokens_to_address_yk(address voter_candidate, uint _amount) external {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        //yk_shares[msg.sender] -= (_amount * 10 ** 18);
        //totalShares -= (_amount * 10 ** 18);
        //total_yk_shares -= (_amount * 10 ** 18);
        //ones above are in comments becaue this whole process is done in the contract
        voter_shares_to_be_given[voter_candidate] += _amount * 10 ** 18;
        //voter_token.transfer(voter_candidate, (_amount * 10 ** 18));
    }                   

    function send_voter_tokens_to_address_yk_directly(address voter_candidate, uint _amount) public {
        require(has_yk_priviliges(msg.sender) , 'Not a YK');
        //yk_shares[msg.sender] -= (_amount * 10 ** 18);
        //totalShares -= (_amount * 10 ** 18);
        //total_yk_shares -= (_amount * 10 ** 18);
        //ones above are in comments becaue this whole process is done in the contract
        voter_token.transferDAO(voter_candidate, (_amount * 10 ** 18));
        mint_from_DAO_voter_token(_amount);

        //voter_token.transfer(voter_candidate, (_amount * 10 ** 18));
    }        
    //in yk functions token verification tokens have to be in the contract however in voter sending function 
     

    function createProposal(string memory name,string memory description, string[] memory _options, uint256[] memory _options_num, uint256 _power, uint256 _type) external {
        // validate the user has enough shares to create a proposal
        //require(yk_token.balanceOf(msg.sender) >= CREATE_PROPOSAL_MIN_SHARE, 'Not enough shares to create a proposal');
        if (vote_power == 0){
            vote_power == 1
        }
        require(has_yk_priviliges(msg.sender), 'Not enough shares to create a proposal');
        string memory proposal_type;
        //sorun olursa buradan
        if(_type == 0){
            proposal_type = "normal";
        }
        else if(_type == 1){
            proposal_type = "weighted";
        }

        proposals[nextProposalId] = Proposal(
            nextProposalId,
            msg.sender,
            name,
            description,
            block.timestamp,
            _options,
            _options_num,
            Status.Pending,
            _power,
            proposal_type
        );
        nextProposalId++; //might need
        voter_token.update_proposal_num(nextProposalId);
    }      


    function vote_power(uint _proposalId, string[] memory _vote, uint[] memory _power) external {
        Proposal storage proposal = proposals[_proposalId];
        require(votes[msg.sender][_proposalId] == false, 'already voted');
        //i check if the user is a yk or has voter shares
        require(voter_token.balanceOf(msg.sender) > 0, 'Not enough shares to vote on a proposal');
        //bu alttaki sadece 1 kez oylamayi garantilemek icin, teoride bunu kullanmayacakgiz
        //requires(tokens_refunded[msg.sender][_proposalId] == false, 'Already voted);
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, 'Voting period is over');
        require(proposals[_proposalId].status == Status.Pending, 'Voting period is finished');
        uint total_power = 0; 
        for(uint i=0;i<_power.length;i++) //checks if the amount of votes given is equal to the max amount of votes
        {
            total_power = total_power + _power[i];
        }          
        require(total_power <= proposal.power);
        bool init = false;
        //asagida yaptiklarim: iste yapiyo yazmaya usendim
        for(uint i=0;i<proposal.options.length;i++)
        {
            for(uint y=0; y<_vote.length; y++){
                
                if(stringsEquals(proposal.options[i], _vote[y])){
                    init = true;
                }
            }
        }           
        require(init == true);
        /** make sure to add the necessary require checks */

        for(uint i=0;i<proposal.options.length;i++)
        {
            for(uint y=0; y<_vote.length; y++){
                if(stringsEquals(proposal.options[i], _vote[y])){
                    proposal.options_num[i]+= _power[y];
                }
            }
        }

        votes[msg.sender][_proposalId] = true;
        voter_token.update_active_voter_lock_on(_proposalId, msg.sender);


        
    }  

    

    function vote_power_weighted(uint _proposalId, string[] memory _vote, uint[] memory _power, uint weight) external {
        Proposal storage proposal = proposals[_proposalId];
        require(votes[msg.sender][_proposalId] == false, 'already voted');
        require(weight <= (voter_token.balanceOf(msg.sender) / (10 ** 18)), "Dont have enough tokens (change weight)" );

        //i check if the user is a yk or has voter shares
        require(voter_token.balanceOf(msg.sender) > 0, "Dont have enough tokens (literally 0)");
        //bu alttaki sadece 1 kez oylamayi garantilemek icin, teoride bunu kullanmayacakgiz
        //requires(tokens_refunded[msg.sender][_proposalId] == false, 'Already voted);
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, 'Voting period is over');
        require(proposals[_proposalId].status == Status.Pending, 'Voting period is finished');
        uint total_power = 0; 
        for(uint i=0;i<_power.length;i++) //checks if the amount of votes given is equal to the max amount of votes
        {
            total_power = total_power + _power[i];
        }          
        require(total_power <= proposal.power);
        bool init = false;
        //asagida yaptiklarim: iste yapiyo yazmaya usendim
        for(uint i=0;i<proposal.options.length;i++)
        {
            for(uint y=0; y<_vote.length; y++){
                
                if(stringsEquals(proposal.options[i], _vote[y])){
                    init = true;
                }
            }
        }           
        require(init == true);
        /** make sure to add the necessary require checks */

        

        for(uint i=0;i<proposal.options.length;i++)
        {
            for(uint y=0; y<_vote.length; y++){
                if(stringsEquals(proposal.options[i], _vote[y])){
                    proposal.options_num[i]+= _power[y] * weight;
                }
            }
        }

        votes[msg.sender][_proposalId] = true;
        voter_token.update_active_voter_lock_on(_proposalId, msg.sender);


    }   
    //(string[][] memory myproposaloptions, string[][] memory myproposals, string[][] memory myproposalvotes )
    function getProposalName() public view returns (string[] memory){
        //string[][] propoptions;
        string[] memory myprops = new string[](nextProposalId);
        //string[][] propvotes;
        for (uint i = 0; i < nextProposalId; i++) {
            myprops[i] = proposals[i].name;
            //propvotes.push(proposals[i].name);
            //for(uint y = 0; y < proposals[i].options.length; y++){
            //    propvotes[i][y]
            //}
        }
        return myprops;
    }
    function getDaoid() public view returns (uint256){
        return dao_id;

    }
    //my chk is the person I am checking lol
    function has_yk_priviliges(address chk) public view returns (bool){

         if(yk_token.balanceOf(chk) >= 1)
         {
            return true;
         }
         MyDAO current_dao=factory.getCurrentDAO(dao_id);
         MyDAO parent_dao= factory.getParentDAO(current_dao);
         
         
         bool exist=false;
         while(address(parent_dao)!=address(0)){
             if(parent_dao.yk_token().balanceOf(chk) >= 1 * 10 **18)
             {
                 exist=true;
                 break;
             }
             parent_dao= factory.getParentDAO( parent_dao );
         }
         return exist;

    }
    
    function getProposalDescription() public view returns (string[] memory){
        //string[][] propoptions;
        string[] memory myprops = new string[](nextProposalId);
        //string[][] propvotes;
        for (uint i = 0; i < nextProposalId; i++) {
            myprops[i] = proposals[i].proposal_description;
            //propvotes.push(proposals[i].name);
            //for(uint y = 0; y < proposals[i].options.length; y++){
            //    propvotes[i][y]
            //}
        }
        return myprops;
    }

    function getProposalVoteNames(uint proposal_idd) public view returns (string[] memory){
        //string[][] propoptions;
        string[] memory mypropvotes = new string[](proposals[proposal_idd].options.length);
        //string[][] propvotes;
        for (uint i = 0; i < proposals[proposal_idd].options.length; i++) {
            mypropvotes[i] = proposals[proposal_idd].options[i];
            //propvotes.push(proposals[i].name);
            //for(uint y = 0; y < proposals[i].options.length; y++){
            //    propvotes[i][y]
            //}
        }
        return mypropvotes;
    }    

    function getProposalVoteNumbers(uint proposal_idd) public view returns (uint[] memory){
        //string[][] propoptions;
        uint[] memory mypropvotenums = new uint[](proposals[proposal_idd].options_num.length);
        //string[][] propvotes;
        for (uint i = 0; i < proposals[proposal_idd].options_num.length; i++) {
            mypropvotenums[i] = proposals[proposal_idd].options_num[i];
            //propvotes.push(proposals[i].name);
            //for(uint y = 0; y < proposals[i].options.length; y++){
            //    propvotes[i][y]
            //}
        }
        return mypropvotenums;
    }    

    function getProposalPower(uint proposal_idd) public view returns (uint ){
        //string[][] propoptions;
        uint myproppower = 0;
        //string[][] propvotes;
        myproppower = proposals[proposal_idd].power;

        return myproppower;
    }     

    function getProposalType(uint proposal_idd) public view returns (string memory){
        //string[][] propoptions;
        
        //string[][] propvotes;
        string memory myproppower = proposals[proposal_idd].proposal_info_type;

        return myproppower;
    }     

    
    //form = b tokeni gecici olarak alan kisi to = a tokeni basta gonderen kisi 
    function dao_delegation_single_getback_amount_voter(address from, uint256 amount) external{
        require(amount <= voter_token.getDebtToken(from), "not enough debt somehow");       
        voter_token. delegation_single_getback_amount(from, msg.sender, amount);        
    }

    function dao_delegation_single_getback_all_voter(address from ) external  {
        voter_token.delegation_single_getback_all(from, msg.sender);
    }

    function dao_delagation_multiple_getback_all_voter( ) external{
        voter_token.delagation_multiple_getback_all( msg.sender);
    }
    function dao_clawback_single_voter(address from) external{
        require(has_yk_priviliges(msg.sender), "does not have yk priviliges") ;
        voter_token.clawback_single( from);
    }
    function dao_clawback_all_voter() external{
        require(has_yk_priviliges(msg.sender), "does not have yk priviliges") ;
        voter_token.clawback_all( );
    }
    




    
    /////////////////////////////////////////////////////////////////////////////////////
    function dao_delegation_single_getback_amount_yk(address from, uint256 amount) external {
        require(amount <= yk_token.getDebtToken(from), "not enough debt somehow");       
        yk_token. delegation_single_getback_amount(from, msg.sender, amount);      
        
    }
    function dao_delegation_single_getback_all_yk(address from) external {
        yk_token.delegation_single_getback_all(from, msg.sender);

    }
    function dao_delagation_multiple_getback_all_yk() external{
        yk_token.delagation_multiple_getback_all(msg.sender);
    }
    function dao_clawback_single_yk(address to) external{
        require(has_yk_priviliges(msg.sender), "does not have yk priviliges") ;
        yk_token.clawback_single( to);
    }
    function dao_clawback_all_yk() external {
        require(has_yk_priviliges(msg.sender), "does not have yk priviliges") ;
        yk_token.clawback_all( );
    }

    function delete_this_dao( ) external {
        require(has_yk_priviliges(msg.sender) || msg.sender == address(factory) , "does not have yk priviliges or is not factory") ;
        voter_token.clawback_all( );
        factory.delete_DAO(this, msg.sender);
        yk_token.clawback_all( );
    }





}                   


   
