// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./lib/CourseModule.sol";
import "./lib/InstructorModule.sol";
import "./lib/StudentModule.sol";
import "./lib/EnrollmentModule.sol";
import "./lib/AttendanceModule.sol";

contract Celorean is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    CourseModule,
    InstructorModule,
    StudentModule,
    EnrollmentModule,
    AttendanceModule
{
    uint256 private _tokenIdCounter;

    modifier onlyLecturer() {
        require(
            lecturers[msg.sender] > 0,
            "Only lecturer can perform this action"
        );
        _;
    }

    modifier onlyStudentRole() {
        require(isStudent[msg.sender], "Only student can perform this action");
        _;
    }

    function initialize(
        string memory name,
        string memory symbol,
        address owner
    ) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __CourseModule_init();
        __InstructorModule_init();
        __StudentModule_init();
        __EnrollmentModule_init();
        __AttendanceModule_init();
        _tokenIdCounter = 0;

        // Transfer ownership to the specified owner if different from deployer
        if (owner != msg.sender) {
            _transferOwnership(owner);
        }
    }

    function createCourse(
        string memory title,
        uint256 duration,
        string memory description,
        uint256 price,
        string[] memory tags,
        string memory level,
        string memory metadataUri
    ) public override onlyLecturer returns (uint256) {
        uint256 courseId = super.createCourse(
            title,
            duration,
            description,
            price,
            tags,
            level,
            metadataUri
        );

        // Mint NFT for course creation
        _tokenIdCounter++;
        _mint(msg.sender, _tokenIdCounter);

        return courseId;
    }

    function registerForCourse(
        uint256 courseId,
        address student
    ) public payable override nonReentrant {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(isStudent[student], "Address is not a registered student");
        // Add duplicate enrollment check
        require(
            !isEnrolled[courseId][student],
            "Student already enrolled in this course"
        );

        Course memory course = courses[courseId];
        require(msg.value >= course.price, "Insufficient payment");

        super.registerForCourse(courseId, student);
        super.incrementEnrollment(courseId);

        // Mint NFT for enrollment
        _tokenIdCounter++;
        _mint(student, _tokenIdCounter);

        // Refund excess payment
        if (msg.value > course.price) {
            payable(msg.sender).transfer(msg.value - course.price);
        }
    }

    function createClassSession(
        uint256 courseId
    ) public override onlyLecturer returns (uint256) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Not the course instructor"
        );

        uint256 sessionId = super.createClassSession(courseId);

        // Mint NFT for session creation
        _tokenIdCounter++;
        _mint(msg.sender, _tokenIdCounter);

        return sessionId;
    }

    function markAttendance(
        uint256 sessionId,
        address student
    ) public override onlyLecturer {
        require(isStudent[student], "Address is not a registered student");
        super.markAttendance(sessionId, student);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    // Override required functions
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
