// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "./lib/CourseModule.sol";
import "./lib/InstructorModule.sol";
import "./lib/StudentModule.sol";
import "./lib/EnrollmentModule.sol";
import "./lib/AttendanceModule.sol";
import "./lib/CredentialModule.sol";
import "./lib/ProgressModule.sol";

// Lightweight interface for the Certificate NFT contract
interface ICertificateNFT {
    function mintCertificateForCredential(
        address to,
        uint256 credentialId,
        string memory title,
        string memory metadataUri
    ) external returns (uint256);
}

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
    CredentialModule,
    ProgressModule
{
    // Address of external Certificate NFT contract (upgrade-safe new storage)
    address public certificateNFT;
    event CertificateNFTUpdated(address indexed nft);

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
        __Ownable_init(owner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __CourseModule_init();
        __InstructorModule_init();
        __StudentModule_init();
        __EnrollmentModule_init();
        __AttendanceModule_init();
        __CredentialModule_init();
        __ProgressModule_init();
        _tokenIdCounter = 0;
        // certificateNFT left unset by default; can be set post-deploy
    }

    function createCourse(
        string memory title,
        uint256 duration,
        string memory description,
        // price removed
        string[] memory tags,
        string memory level,
        string memory metadataUri,
        uint256 capacity
    ) public onlyLecturer returns (uint256) {
        require(
            courseNameToId[title] == 0,
            "Course with this name already exists"
        );
        courseCount++;
        uint256 courseId = courseCount;

        courses[courseId] = Course({
            id: courseId,
            title: title,
            description: description,
            duration: duration,
            // price removed
            tags: tags,
            level: level,
            rating: 0,
            enrolledCount: 0,
            capacity: capacity,
            instructor: msg.sender,
            metadataUri: metadataUri,
            contentUris: new string[](0)
        });

        courseNameToId[title] = courseId;

        emit CourseCreated(courseId, title, msg.sender, metadataUri);

        // Mint NFT for course creation
        _tokenIdCounter++;
        _mint(msg.sender, _tokenIdCounter);

        return courseId;
    }

    function registerForCourse(
        uint256 courseId,
        address student
    ) public override nonReentrant {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(isStudent[student], "Address is not a registered student");
        // Add duplicate enrollment check
        require(
            !isEnrolled[courseId][student],
            "Student already enrolled in this course"
        );

        Course memory course = courses[courseId];
        // Payment check removed
        require(course.enrolledCount < course.capacity, "Course is full");

        super.registerForCourse(courseId, student);
        super.incrementEnrollment(courseId);

        // Mint NFT for enrollment
        _tokenIdCounter++;
        _mint(student, _tokenIdCounter);

        // Refund logic removed
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
        require(
            isEnrolled[courseIdForSession][student],
            "Student not enrolled in this course"
        );
        super.markAttendance(sessionId, student);
    }

    function markAttendance(uint256 sessionId) public {
        require(isStudent[msg.sender], "Only student can perform this action");
        // Ensure the student is enrolled in the course for this session
        uint256 courseIdForSession = classSessions[sessionId].courseId;
        require(courseIdForSession > 0, "Session not found");
        require(
            isEnrolled[courseIdForSession][msg.sender],
            "Student not enrolled in this course"
        );

        // Check if session is active/valid? (Optional, but good practice)
        // For now just call super
        super.markAttendance(sessionId, msg.sender);
    }

    // Set or update the Certificate NFT contract address
    function setCertificateNFT(address nft) external onlyOwner {
        require(nft != address(0), "Invalid NFT address");
        certificateNFT = nft;
        emit CertificateNFTUpdated(nft);
    }

    // Credential issuance: restricted to lecturers (or owner)
    function issueCredentialForStudent(
        address student,
        string memory title,
        string memory metadataUri
    ) external onlyLecturer returns (uint256) {
        require(isStudent[student], "Not a registered student");
        uint256 credentialId = _issueCredential(
            student,
            msg.sender,
            title,
            metadataUri
        );

        // If Certificate NFT contract configured, mint a certificate NFT linked to the credential
        if (certificateNFT != address(0)) {
            try
                ICertificateNFT(certificateNFT).mintCertificateForCredential(
                    student,
                    credentialId,
                    title,
                    metadataUri
                )
            returns (uint256 /*tokenId*/) {
                // no-op; frontend can query certificate contract by student/credential id
            } catch {
                // Swallow errors to avoid blocking core credential issuance
            }
        }
        return credentialId;
    }

    function admitStudent(
        address student,
        uint256 amount
    ) external onlyLecturer {
        _admitStudent(student, amount);
    }

    function employLecturer(
        address lecturer,
        uint256 value
    ) external onlyOwner {
        _employLecturer(lecturer, value);
    }

    function rewardStudent(
        address student,
        uint256 amount
    ) external onlyLecturer {
        _addStudentTokens(student, amount);
    }

    function calculateAttendancePercentage() external view returns (uint256) {
        uint256[] memory myCourses = studentCourses[msg.sender];
        uint256 totalSessions = 0;
        uint256 attendedSessions = 0;

        for (uint256 i = 0; i < myCourses.length; i++) {
            uint256[] memory sessions = courseSessions[myCourses[i]];
            totalSessions += sessions.length;
            for (uint256 j = 0; j < sessions.length; j++) {
                if (studentSessionAttendance[msg.sender][sessions[j]] == 1) {
                    attendedSessions++;
                }
            }
        }

        if (totalSessions == 0) {
            return 0;
        }

        return (attendedSessions * 100) / totalSessions;
    }

    event FundsWithdrawn(address indexed owner, uint256 amount);

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // Authorization: admin, course instructor, or enrolled student can view course details
    function _isAuthorizedToViewCourse(
        uint256 /* courseId */,
        address /* viewer */
    ) internal pure override returns (bool) {
        // Basic bounds check
        /* if (courseId == 0 || courseId > courseCount) {
            return false;
        }
        // Admin (owner) can view all courses
        if (viewer == owner()) {
            return true;
        }
        // Instructor can view their own courses
        if (courses[courseId].instructor == viewer) {
            return true;
        }
        // Enrolled students can view courses they're registered in
        if (isStudent[viewer] && isEnrolled[courseId][viewer]) {
            return true;
        } */
        return true;
    }

    // Only enrolled students can update course rating
    function updateCourseRating(
        uint256 courseId,
        uint256 newRating
    ) public override {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            isEnrolled[courseId][msg.sender],
            "Only enrolled students can rate"
        );
        super.updateCourseRating(courseId, newRating);
    }

    // Progress Tracking
    function markContentComplete(
        uint256 courseId,
        uint256 contentIndex
    ) public nonReentrant onlyStudentRole {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            isEnrolled[courseId][msg.sender],
            "Student not enrolled in this course"
        );
        require(
            contentIndex < courses[courseId].contentUris.length,
            "Invalid content index"
        );

        _markContentComplete(courseId, msg.sender, contentIndex);
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
