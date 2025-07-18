// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract StudentManager is Initializable {
    struct Performance {
        uint256 completedModules;
        uint256 quizScore;
        uint256 learningTime;
    }

    mapping(address => Performance) internal studentPerformance;

    function __StudentManager_init() internal onlyInitializing {}

    function _updatePerformance(
        address student,
        uint256 modules,
        uint256 score,
        uint256 timeSpent
    ) internal {
        Performance storage perf = studentPerformance[student];
        perf.completedModules += modules;
        perf.quizScore += score;
        perf.learningTime += timeSpent;
    }

    function getPerformance(address student) public view returns (Performance memory) {
        return studentPerformance[student];
    }
}
