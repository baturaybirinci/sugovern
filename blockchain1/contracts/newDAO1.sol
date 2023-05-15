// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./itoken.sol";
import "./newFactory1.sol";

/**
 * @title MyDAO
 * @dev MyDAO is a smart contract that implements a decentralized autonomous organization (DAO).
 * It allows members to create proposals and vote on them. The status of a proposal can be
 * accepted, rejected, or pending. It also provides a function for comparing two strings.
 */
contract MyDAO {
    // Public variables
    string public dao_name;             // Name of the DAO
    string public dao_description;      // Description of the DAO
    string[] public debug_array;        // Debugging information stored as an array of strings
    string public imageUrl;             // URL for the DAO's image
    uint256 dao_id;                     // Unique identifier for the DAO
    enum VotingOptions { Yes, No }      // Enumeration for voting options (Yes or No)
    enum Status { Accepted, Rejected, Pending }  // Enumeration for proposal status (Accepted, Rejected, or Pending)

    // Private variables
    address public test;                // Address of a test account
    struct Proposal {
        uint256 id;                     // Unique identifier for the proposal
        address author;                 // Address of the proposal author
        string name;                    // Name of the proposal
        string proposal_description;    // Description of the proposal
        uint256 createdAt;              // Timestamp of when the proposal was created
        string[] options;               // Array of options for the proposal
        uint256[] options_num;           // Array of integers representing the number of votes for each option
        Status status;                  // Status of the proposal
        uint256 power;                  // Power of the proposal (to be defined by the DAO)
        string proposal_info_type;      // Type of proposal information
    }

    /**
     * @dev Private function to compare two strings.
     * @param s1 First string to compare.
     * @param s2 Second string to compare.
     * @return A boolean indicating whether the two strings are equal.
     */
    function stringsEquals(string memory s1, string memory s2) private pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i = 0; i < l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    // DAOFactory contract
    DAOFactory factory;


    // Store all proposals
    mapping(uint => Proposal) public proposals;

    // Event to print out proposal information
    event proposal_info(uint256 id, address author, string name, string proposal_description, string[] options, uint256[] num_options, uint256 power, string proposal_info_type);

    // Tracks which address has already voted for a proposal to avoid double voting
    mapping(address => mapping(uint => bool)) public votes;

    // Tracks whether tokens have been refunded for a proposal to avoid multiple refunds
    mapping(address => mapping(uint => bool)) public tokens_not_refunded;

    // Tracks the amount of tokens to be refunded for a voter
    mapping(address => mapping(uint => uint)) public token_amount_to_be_refunded;

    // Number of voter shares to be given
    mapping(address => uint256) public voter_shares_to_be_given;

    // Number of YK shares to be given
    mapping(address => uint256) public yk_shares_to_be_given;

    // The governance token contracts
    ISUToken public voter_token;
    ISUToken public yk_token;

    // The minimum shares required to create a proposal
    uint constant CREATE_PROPOSAL_MIN_SHARE = 1 * 10 ** 18;

    // The duration of the voting period
    uint constant VOTING_PERIOD = 7 days;

    // ID for the next proposal
    uint public nextProposalId;

    // Tracks the transfer lock status for addresses
    mapping(address => bool) transferLock;

    /**
     * @dev Constructor function to initialize the DAO contract
     * @param _dao_name The name of the DAO
     * @param _imageUrl The URL of the DAO's image
     * @param _dao_description The description of the DAO
     * @param _dao_id The ID of the DAO
     * @param first_yk The address of the initial YK token holder
     * @param yk_token_in The YK token contract
     * @param voter_token_in The voter token contract
     * @param _factory The DAOFactory contract
     */
    constructor(
        string memory _dao_name,
        string memory _imageUrl,
        string memory _dao_description,
        uint _dao_id,
        address first_yk,
        ISUToken yk_token_in,
        ISUToken voter_token_in,
        DAOFactory _factory
    ) {
        factory = _factory;
        dao_name = _dao_name;
        dao_id = _dao_id;
        dao_description = _dao_description;
        yk_token = yk_token_in;
        voter_token = voter_token_in;
        imageUrl = _imageUrl;

        yk_shares_to_be_given[first_yk] += (1 * 10 ** 18);
        voter_shares_to_be_given[first_yk] += (1 * 10 ** 18);
    }


    /**
     * @dev Allows the DAO contract to mint YK tokens
     * @param _amount The amount of YK tokens to mint
     */
    function mint_from_DAO_yk_token(uint _amount) internal {
        factory.mint_dao_yk(this, _amount, msg.sender);
    }

    /**
     * @dev Allows the DAO contract to mint voter tokens
     * @param _amount The amount of voter tokens to mint
     */
    function mint_from_DAO_voter_token(uint _amount) internal {
        factory.mint_dao_voter(this, _amount, msg.sender);
    }

    /**
     * @dev Iterates through all proposals and emits proposal information
     */
    function iterate_proposals() public {
        for (uint i = 0; i < nextProposalId; i++) {
            if (proposals[i].status != Status.Pending) {
                voter_token.update_active_voter_lock_off(i, msg.sender);
            }

            emit proposal_info(
                proposals[i].id,
                proposals[i].author,
                proposals[i].name,
                proposals[i].proposal_description,
                proposals[i].options,
                proposals[i].options_num,
                proposals[i].power,
                proposals[i].proposal_info_type
            );
        }
    }

    /**
     * @dev Accepts a proposal and changes its status to Accepted
     * @param _proposalId The ID of the proposal to accept
     */
    function accept_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Accepted;
    }

    /**
     * @dev Rejects a proposal and changes its status to Rejected
     * @param _proposalId The ID of the proposal to reject
     */
    function reject_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Rejected;
    }

    /**
     * @dev Sets a proposal's status to Pending
     * @param _proposalId The ID of the proposal to set as Pending
     */
    function pending_proposal(uint _proposalId) external {
        proposals[_proposalId].status = Status.Pending;
    }

    /**
     * @dev Allows a user to withdraw voter tokens from the DAO
     * @param _amount The amount of voter tokens to withdraw
     */
    function withdraw_voter_tokens(uint _amount) external {
        require(voter_shares_to_be_given[msg.sender] >= _amount * 10**18, 'Not enough shares');
        voter_shares_to_be_given[msg.sender] -= (_amount * 10**18);
        voter_token.transferDAO(msg.sender, (_amount * 10**18));
        mint_from_DAO_voter_token(_amount);
    }






    /**
     * @dev Allows a user to withdraw YK tokens
     * @param _amount The amount of YK tokens to withdraw
     */
    function withdraw_yk_tokens(uint _amount) external {
        require(yk_shares_to_be_given[msg.sender] >= _amount, 'Not enough shares');
        yk_shares_to_be_given[msg.sender] -= (_amount * 10 ** 18);
        yk_token.transferDAO(msg.sender, (_amount * 10 ** 18));
        mint_from_DAO_yk_token(_amount);
    }

    /**
     * @dev Sends YK tokens to a specified address
     * @param yk_candidate The address to send the YK tokens to
     * @param _amount The amount of YK tokens to send
     */
    function send_yk_tokens_to_address_yk(address yk_candidate, uint _amount) external {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        yk_shares_to_be_given[yk_candidate] += _amount * 10 ** 18;
    }

    /**
     * @dev Sends YK tokens directly to a specified address from the DAO
     * @param yk_candidate The address to send the YK tokens to
     * @param _amount The amount of YK tokens to send
     */
    function send_yk_tokens_to_address_yk_directly(address yk_candidate, uint _amount) public {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        yk_token.transferDAO(yk_candidate, (_amount * 10 ** 18));
        mint_from_DAO_yk_token(_amount);
    }

    /**
     * @dev Sends voter tokens to a specified address
     * @param voter_candidate The address to send the voter tokens to
     * @param _amount The amount of voter tokens to send
     */
    function send_voter_tokens_to_address_yk(address voter_candidate, uint _amount) external {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        voter_shares_to_be_given[voter_candidate] += _amount * 10 ** 18;
    }

    /**
     * @dev Sends voter tokens directly to a specified address from the DAO
     * @param voter_candidate The address to send the voter tokens to
     * @param _amount The amount of voter tokens to send
     */
    function send_voter_tokens_to_address_yk_directly(address voter_candidate, uint _amount) public {
        require(has_yk_priviliges(msg.sender), 'Not a YK');
        voter_token.transferDAO(voter_candidate, (_amount * 10 ** 18));
        mint_from_DAO_voter_token(_amount);
    }


    /**
     * @dev Creates a new proposal
     * @param name The name of the proposal
     * @param description The description of the proposal
     * @param _options An array of vote options
     * @param _options_num An array of corresponding vote option numbers
     * @param _power The maximum vote power for the proposal
     * @param _type The type of the proposal (0: normal, 1: weighted)
     */
    function createProposal(
        string memory name,
        string memory description,
        string[] memory _options,
        uint256[] memory _options_num,
        uint256 _power,
        uint256 _type
    ) external {
        require(has_yk_priviliges(msg.sender), 'Message sender does not have YK privileges');

        string memory proposal_type;
        if (_type == 0) {
            proposal_type = "normal";
        } else if (_type == 1) {
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
        nextProposalId++;
        voter_token.update_proposal_num(nextProposalId);
    }

    /**
     * @dev Performs a non-weighted vote on a proposal
     * @param _proposalId The ID of the proposal
     * @param _vote An array of vote options
     * @param _power An array of corresponding vote powers
     */
    function vote_power(uint _proposalId, string[] memory _vote, uint[] memory _power) external {
        Proposal storage proposal = proposals[_proposalId];
        require(votes[msg.sender][_proposalId] == false, 'Already voted');
        require(voter_token.balanceOf(msg.sender) > 0, 'Not enough shares to vote on a proposal');
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, 'Voting period is over');
        require(proposals[_proposalId].status == Status.Pending, 'Voting period is finished');
        uint total_power = 0;

        for (uint i = 0; i < _power.length; i++) {
            total_power = total_power + _power[i];
        }

        require(total_power <= proposal.power);
        bool init = false;

        for (uint i = 0; i < proposal.options.length; i++) {
            for (uint y = 0; y < _vote.length; y++) {
                if (stringsEquals(proposal.options[i], _vote[y])) {
                    init = true;
                }
            }
        }

        require(init == true);

        for (uint i = 0; i < proposal.options.length; i++) {
            for (uint y = 0; y < _vote.length; y++) {
                if (stringsEquals(proposal.options[i], _vote[y])) {
                    proposal.options_num[i] += _power[y];
                }
            }
        }

        votes[msg.sender][_proposalId] = true;
        voter_token.update_active_voter_lock_on(_proposalId, msg.sender);
    }


    /**
     * @dev Performs a weighted vote on a proposal
     * @param _proposalId The ID of the proposal
     * @param _vote An array of vote options
     * @param _power An array of corresponding vote powers
     * @param weight The weight to apply to the vote powers
     */
    function vote_power_weighted(uint _proposalId, string[] memory _vote, uint[] memory _power, uint weight) external {
        Proposal storage proposal = proposals[_proposalId];
        require(votes[msg.sender][_proposalId] == false, 'already voted');
        require(weight <= (voter_token.balanceOf(msg.sender) / (10 ** 18)), "Don't have enough tokens (change weight)");

        require(voter_token.balanceOf(msg.sender) > 0, "Don't have enough tokens (literally 0)");
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, 'Voting period is over');
        require(proposals[_proposalId].status == Status.Pending, 'Voting period is finished');
        uint total_power = 0;

        for (uint i = 0; i < _power.length; i++) {
            total_power = total_power + _power[i];
        }

        require(total_power <= proposal.power);
        bool init = false;

        for (uint i = 0; i < proposal.options.length; i++) {
            for (uint y = 0; y < _vote.length; y++) {
                if (stringsEquals(proposal.options[i], _vote[y])) {
                    init = true;
                }
            }
        }

        require(init == true);

        for (uint i = 0; i < proposal.options.length; i++) {
            for (uint y = 0; y < _vote.length; y++) {
                if (stringsEquals(proposal.options[i], _vote[y])) {
                    proposal.options_num[i] += _power[y] * weight;
                }
            }
        }

        votes[msg.sender][_proposalId] = true;
        voter_token.update_active_voter_lock_on(_proposalId, msg.sender);
    }

    /**
     * @dev Retrieves the names of all proposals
     * @return An array of proposal names
     */
    function getProposalName() public view returns (string[] memory) {
        string[] memory myprops = new string[](nextProposalId);

        for (uint i = 0; i < nextProposalId; i++) {
            myprops[i] = proposals[i].name;
        }

        return myprops;
    }

    /**
     * @dev Retrieves the DAO ID
     * @return The DAO ID
     */
    function getDaoid() public view returns (uint256) {
        return dao_id;
    }

    /**
     * @dev Checks if the address has YK privileges
     * @param chk The address to check for YK privileges
     * @return A boolean indicating if the address has YK privileges
     */
    function has_yk_priviliges(address chk) public view returns (bool) {
        if (yk_token.balanceOf(chk) >= 1) {
            return true;
        }

        MyDAO current_dao = factory.getCurrentDAO(dao_id);
        MyDAO parent_dao = factory.getParentDAO(current_dao);
        bool exist = false;

        while (address(parent_dao) != address(0)) {
            if (parent_dao.yk_token().balanceOf(chk) >= 1 * 10 ** 18) {
                exist = true;
                break;
            }
            parent_dao = factory.getParentDAO(parent_dao);
        }

        return exist;
    }

    /**
     * @dev Retrieves the descriptions of all proposals
     * @return An array of proposal descriptions
     */
    function getProposalDescription() public view returns (string[] memory) {
        string[] memory myprops = new string[](nextProposalId);

        for (uint i = 0; i < nextProposalId; i++) {
            myprops[i] = proposals[i].proposal_description;
        }

        return myprops;
    }

    /**
     * @dev Retrieves the vote names/options of a specific proposal
     * @param proposal_idd The ID of the proposal
     * @return An array of vote names/options for the proposal
     */
    function getProposalVoteNames(uint proposal_idd) public view returns (string[] memory) {
        string[] memory mypropvotes = new string[](proposals[proposal_idd].options.length);

        for (uint i = 0; i < proposals[proposal_idd].options.length; i++) {
            mypropvotes[i] = proposals[proposal_idd].options[i];
        }

        return mypropvotes;
    }

    /**
     * @dev Retrieves the vote numbers/totals of a specific proposal
     * @param proposal_idd The ID of the proposal
     * @return An array of vote numbers/totals for the proposal
     */
    function getProposalVoteNumbers(uint proposal_idd) public view returns (uint[] memory) {
        uint[] memory mypropvotenums = new uint[](proposals[proposal_idd].options_num.length);

        for (uint i = 0; i < proposals[proposal_idd].options_num.length; i++) {
            mypropvotenums[i] = proposals[proposal_idd].options_num[i];
        }

        return mypropvotenums;
    }


    /**
     * @dev Retrieves the power of a specific proposal
     * @param proposal_idd The ID of the proposal
     * @return The power of the proposal
     */
    function getProposalPower(uint proposal_idd) public view returns (uint) {
        uint myproppower = proposals[proposal_idd].power;
        return myproppower;
    }

    /**
     * @dev Retrieves the type of a specific proposal
     * @param proposal_idd The ID of the proposal
     * @return The type of the proposal
     */
    function getProposalType(uint proposal_idd) public view returns (string memory) {
        string memory myproppower = proposals[proposal_idd].proposal_info_type;
        return myproppower;
    }

    /**
     * @dev Performs single token getback for voter delegation
     * @param from The address from which to get back tokens
     * @param amount The amount of tokens to get back
     * Requirements:
     * - The amount must be less than or equal to the debt tokens held by 'from'
     */
    function dao_delegation_single_getback_amount_voter(address from, uint256 amount) external {
        require(amount <= voter_token.getDebtToken(from), "not enough debt");
        voter_token.delegation_single_getback_amount(from, msg.sender, amount);
    }

    /**
     * @dev Performs single token getback for voter delegation, getting back all tokens
     * @param from The address from which to get back tokens
     */
    function dao_delegation_single_getback_all_voter(address from) external {
        voter_token.delegation_single_getback_all(from, msg.sender);
    }

    /**
     * @dev Performs multiple token getback for voter delegation, getting back all tokens
     */
    function dao_delagation_multiple_getback_all_voter() external {
        voter_token.delagation_multiple_getback_all(msg.sender);
    }

    /**
     * @dev Performs single token clawback for voter delegation
     * @param from The address from which to claw back tokens
     * Requirements:
     * - The caller must have YK privileges
     */
    function dao_clawback_single_voter(address from) external {
        require(has_yk_priviliges(msg.sender), "does not have YK privileges");
        voter_token.clawback_single(from);
    }

    /**
     * @dev Performs clawback of all voter tokens from the DAO
     * Requirements:
     * - The caller must have YK privileges
     */
    function dao_clawback_all_voter() external {
        require(has_yk_priviliges(msg.sender), "does not have YK privileges");
        voter_token.clawback_all();
    }

    /**
     * @dev Performs single token getback for YK delegation
     * @param from The address from which to get back tokens
     * @param amount The amount of tokens to get back
     * Requirements:
     * - The amount must be less than or equal to the debt tokens held by 'from'
     */
    function dao_delegation_single_getback_amount_yk(address from, uint256 amount) external {
        require(amount <= yk_token.getDebtToken(from), "not enough debt");
        yk_token.delegation_single_getback_amount(from, msg.sender, amount);
    }

    /**
     * @dev Performs single token getback for YK delegation, getting back all tokens
     * @param from The address from which to get back tokens
     */
    function dao_delegation_single_getback_all_yk(address from) external {
        yk_token.delegation_single_getback_all(from, msg.sender);
    }

    /**
     * @dev Performs multiple token getback for YK delegation, getting back all tokens
     * Requirements:
     * - The caller must have YK privileges
     */
    function dao_delagation_multiple_getback_all_yk() external {
        require(has_yk_priviliges(msg.sender), "does not have YK privileges");
        yk_token.delagation_multiple_getback_all(msg.sender);
    }

    /**
     * @dev Performs single token clawback for YK delegation
     * @param to The address to which the tokens will be clawed back
     * Requirements:
     * - The caller must have YK privileges
     */
    function dao_clawback_single_yk(address to) external {
        require(has_yk_priviliges(msg.sender), "does not have YK privileges");
        yk_token.clawback_single(to);
    }

    /**
     * @dev Performs clawback of all YK tokens from the DAO
     * Requirements:
     * - The caller must have YK privileges
     */
    function dao_clawback_all_yk() external {
        require(has_yk_priviliges(msg.sender), "does not have YK privileges");
        yk_token.clawback_all();
    }

    /**
     * @dev Deletes the DAO and performs clawback of all voter and YK tokens
     * Requirements:
     * - The caller must have YK privileges or be the factory
     */
    function delete_this_dao() external {
        require(has_yk_priviliges(msg.sender) || msg.sender == address(factory), "does not have YK privileges or is not factory");
        voter_token.clawback_all();
        factory.delete_DAO(this, msg.sender);
        yk_token.clawback_all();
    }
}
