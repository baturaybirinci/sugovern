// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title Migrations
 * @dev This contract handles the deployment and ownership of migration scripts.
 */
contract Migrations {
  address public owner = msg.sender;
  uint public last_completed_migration;

  /**
   * @dev Modifier to restrict access to certain functions to the contract's owner.
   */
  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  /**
   * @dev Sets the completed migration step.
   * @param completed The completed migration step
   */
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}
