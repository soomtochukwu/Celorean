// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract CheckpointManager is Initializable {
    mapping(uint256 => mapping(address => uint256)) internal courseProgress;

    function __CheckpointManager_init() internal onlyInitializing {}

    function _completeCheckpoint(uint256 courseId, address user) internal {
        courseProgress[courseId][user]++;
    }

    function getProgress(uint256 courseId, address user) public view returns (uint256) {
        return courseProgress[courseId][user];
    }
}
