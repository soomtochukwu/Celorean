// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ProgressModule is Initializable {
    // courseId => student => contentIndex => isCompleted
    mapping(uint256 => mapping(address => mapping(uint256 => bool)))
        public completedContents;

    // courseId => student => contentIndex => timestamp
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        public completedTimestamps;

    // courseId => student => totalCompletedCount
    mapping(uint256 => mapping(address => uint256)) public completedCount;

    event ContentCompleted(
        uint256 indexed courseId,
        address indexed student,
        uint256 contentIndex,
        uint256 timestamp
    );

    function __ProgressModule_init() internal onlyInitializing {
        // Initialization logic if needed
    }

    function _markContentComplete(
        uint256 courseId,
        address student,
        uint256 contentIndex
    ) internal {
        require(
            !completedContents[courseId][student][contentIndex],
            "Content already completed"
        );

        completedContents[courseId][student][contentIndex] = true;
        completedTimestamps[courseId][student][contentIndex] = block.timestamp;
        completedCount[courseId][student]++;

        emit ContentCompleted(courseId, student, contentIndex, block.timestamp);
    }

    function getCompletedContentCount(
        uint256 courseId,
        address student
    ) external view returns (uint256) {
        return completedCount[courseId][student];
    }

    function isContentCompleted(
        uint256 courseId,
        address student,
        uint256 contentIndex
    ) external view returns (bool) {
        return completedContents[courseId][student][contentIndex];
    }

    function getCompletedContents(
        uint256 courseId,
        address student,
        uint256 totalContentCount
    ) external view returns (bool[] memory) {
        bool[] memory results = new bool[](totalContentCount);
        for (uint256 i = 0; i < totalContentCount; i++) {
            results[i] = completedContents[courseId][student][i];
        }
        return results;
    }

    function getCompletedTimestamps(
        uint256 courseId,
        address student,
        uint256 totalContentCount
    ) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](totalContentCount);
        for (uint256 i = 0; i < totalContentCount; i++) {
            results[i] = completedTimestamps[courseId][student][i];
        }
        return results;
    }
}
