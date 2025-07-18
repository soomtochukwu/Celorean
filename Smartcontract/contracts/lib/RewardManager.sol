// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract RewardManager is Initializable {
    mapping(address => uint256) internal rewards;

    event RewardGranted(address indexed student, uint256 amount);

    function __RewardManager_init() internal onlyInitializing {}

    function _grantReward(address student, uint256 amount) internal {
        rewards[student] += amount;
        emit RewardGranted(student, amount);
    }

    function getRewardBalance(address student) public view returns (uint256) {
        return rewards[student];
    }
}
