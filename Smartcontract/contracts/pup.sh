#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define contract directory
BASE_DIR="contracts"
UTILS_DIR="$BASE_DIR/best_practices"

# Create necessary folders
mkdir -p "$UTILS_DIR"

echo "Creating modular contracts in $UTILS_DIR..."

# 1. CourseBase.sol
cat > "$UTILS_DIR/CourseBase.sol" << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract CourseBase is Initializable {
    struct Course {
        uint256 id;
        string title;
        string category;
        uint256 price;
        uint256 duration;
        uint256 rating;
        string[] tags;
    }

    mapping(uint256 => Course) internal courses;
    uint256 internal courseCounter;

    event CourseCreated(uint256 indexed courseId, string title);

    function __CourseBase_init() internal onlyInitializing {
        courseCounter = 0;
    }

    function _createCourse(
        string memory title,
        string memory category,
        uint256 price,
        uint256 duration,
        uint256 rating,
        string[] memory tags
    ) internal returns (uint256) {
        courseCounter++;
        courses[courseCounter] = Course(courseCounter, title, category, price, duration, rating, tags);
        emit CourseCreated(courseCounter, title);
        return courseCounter;
    }

    function getCourse(uint256 courseId) public view returns (Course memory) {
        return courses[courseId];
    }
}
EOF

# 2. CheckpointManager.sol
cat > "$UTILS_DIR/CheckpointManager.sol" << 'EOF'
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
EOF

# 3. RewardManager.sol
cat > "$UTILS_DIR/RewardManager.sol" << 'EOF'
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
EOF

# 4. StudentManager.sol
cat > "$UTILS_DIR/StudentManager.sol" << 'EOF'
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
EOF

# 5. AccessControlManager.sol
cat > "$UTILS_DIR/AccessControlManager.sol" << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract AccessControlManager is AccessControlUpgradeable {
    bytes32 public constant INSTRUCTOR_ROLE = keccak256("INSTRUCTOR_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    function __AccessControlManager_init(address admin) internal onlyInitializing {
        __AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    modifier onlyInstructor() {
        require(hasRole(INSTRUCTOR_ROLE, msg.sender), "Not instructor");
        _;
    }

    modifier onlyStudent() {
        require(hasRole(STUDENT_ROLE, msg.sender), "Not student");
        _;
    }
}
EOF

# 6. Celorean.sol
cat > "$BASE_DIR/Celorean.sol" << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./best_practices/CourseBase.sol";
import "./best_practices/CheckpointManager.sol";
import "./best_practices/RewardManager.sol";
import "./best_practices/StudentManager.sol";
import "./best_practices/AccessControlManager.sol";

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
        __AccessControlManager_init(admin);
        __CourseBase_init();
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

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
EOF

echo "✅ All Celorean contracts created successfully."
