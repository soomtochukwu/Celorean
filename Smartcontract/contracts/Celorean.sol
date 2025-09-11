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
import "./lib/CredentialModule.sol";

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
    AttendanceModule,
    CredentialModule
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
        __CredentialModule_init();
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
    ) public onlyLecturer returns (uint256) {
        courseCount++;
        uint256 courseId = courseCount;
        
        courses[courseId] = Course({
            id: courseId,
            title: title,
            description: description,
            duration: duration,
            price: price,
            tags: tags,
            level: level,
            rating: 0,
            enrolledCount: 0,
            instructor: msg.sender,
            metadataUri: metadataUri,
            contentUris: new string[](0)
        });
        
        courseNameToId[title] = courseId;
        
        emit CourseCreated(courseId, title, msg.sender, price, metadataUri);

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
        // Ensure the student is enrolled in the course for this session
        uint256 courseIdForSession = classSessions[sessionId].courseId;
        require(courseIdForSession > 0, "Session not found");
        require(isEnrolled[courseIdForSession][student], "Student not enrolled in this course");
        super.markAttendance(sessionId, student);
    }

    // Credential issuance: restricted to lecturers (or owner)
    function issueCredentialForStudent(
        address student,
        string memory title,
        string memory metadataUri
    ) external onlyLecturer returns (uint256) {
        require(isStudent[student], "Not a registered student");
        return _issueCredential(student, msg.sender, title, metadataUri);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // Authorization: only instructor or admitted+enrolled student can view course data/materials
    function _isAuthorizedToViewCourse(uint256 courseId, address viewer)
        internal
        view
        override
        returns (bool)
    {
        // Basic bounds check
        if (courseId == 0 || courseId > courseCount) {
            return false;
        }
        // Instructor always authorized
        if (courses[courseId].instructor == viewer) {
            return true;
        }
        // Require the viewer to be an admitted student AND enrolled in the course
        if (isStudent[viewer] && isEnrolled[courseId][viewer]) {
            return true;
        }
        return false;
    }

    // Only enrolled students can update course rating
    function updateCourseRating(
        uint256 courseId,
        uint256 newRating
    ) public override {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(isEnrolled[courseId][msg.sender], "Only enrolled students can rate");
        super.updateCourseRating(courseId, newRating);
    }

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
