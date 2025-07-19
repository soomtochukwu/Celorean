// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./lib/CourseBase.sol";
import "./lib/CheckpointManager.sol";
import "./lib/RewardManager.sol";
import "./lib/StudentManager.sol";
import "./lib/AccessControlManager.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Celorean is
    Initializable,
    UUPSUpgradeable,
    CourseBase,
    CheckpointManager,
    RewardManager,
    StudentManager,
    AccessControlManager
{
    function initialize(address admin) public initializer {
        __CourseBase_init();
        __AccessControlManager_init(admin);
        __CheckpointManager_init();
        __RewardManager_init();
        __StudentManager_init();
    }

    function createCourse(
        string memory title,
        string memory category,
        uint256 price,
        uint256 duration,
        uint256 rating,
        string[] memory tags
    ) external onlyInstructor returns (uint256) {
        return _createCourse(title, category, price, duration, rating, tags);
    }

    function completeCheckpoint(uint256 courseId) external onlyStudent {
        _completeCheckpoint(courseId, msg.sender);
        _grantReward(msg.sender, 10);
        _updatePerformance(msg.sender, 1, 5, 300);
    }

    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
