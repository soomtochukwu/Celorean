// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CourseModule is Initializable {
    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 duration; // in weeks
        // price removed
        string[] tags;
        string level; // Beginner, Intermediate, Advanced
        uint256 rating; // out of 50 (4.7 = 47)
        uint256 enrolledCount;
        uint256 capacity; // Max students
        address instructor;
        string metadataUri; // IPFS URI for course metadata
        string[] contentUris; // Array of IPFS URIs for course content
    }

    // Authorization hook to be overridden by inheriting contract (default: open)
    function _isAuthorizedToViewCourse(
        uint256 /*courseId*/,
        address /*viewer*/
    ) internal view virtual returns (bool) {
        return true;
    }

    event CourseContentAdded(
        uint256 indexed courseId,
        string newContentUri,
        uint256 contentIndex
    );

    event CourseContentUpdated(
        uint256 indexed courseId,
        string[] newContentUris
    );

    uint256 public courseCount;
    mapping(uint256 => Course) internal courses;
    mapping(string => uint256) public courseNameToId;

    event CourseCreated(
        uint256 indexed courseId,
        string title,
        address indexed instructor,
        // price removed
        string metadataUri
    );

    event CourseMetadataUpdated(
        uint256 indexed courseId,
        string newMetadataUri
    );

    function updateCourseMetadata(
        uint256 courseId,
        string memory newMetadataUri
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can update metadata"
        );

        courses[courseId].metadataUri = newMetadataUri;
        emit CourseMetadataUpdated(courseId, newMetadataUri);
    }

    function __CourseModule_init() internal onlyInitializing {}

    function addCourseContent(
        uint256 courseId,
        string memory newContentUri
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can add content"
        );
        require(bytes(newContentUri).length > 0, "Content URI cannot be empty");

        courses[courseId].contentUris.push(newContentUri);
        emit CourseContentAdded(
            courseId,
            newContentUri,
            courses[courseId].contentUris.length - 1
        );
    }

    function addMultipleCourseContent(
        uint256 courseId,
        string[] memory newContentUris
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can add content"
        );
        require(
            newContentUris.length > 0,
            "Content URIs array cannot be empty"
        );

        for (uint256 i = 0; i < newContentUris.length; i++) {
            require(
                bytes(newContentUris[i]).length > 0,
                "Content URI cannot be empty"
            );
            courses[courseId].contentUris.push(newContentUris[i]);
        }

        emit CourseContentUpdated(courseId, courses[courseId].contentUris);
    }

    function getCourseContentUris(
        uint256 courseId
    ) external view returns (string[] memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            _isAuthorizedToViewCourse(courseId, msg.sender),
            "Access denied: not authorized"
        );
        return courses[courseId].contentUris;
    }

    function getCourseContentCount(
        uint256 courseId
    ) external view returns (uint256) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            _isAuthorizedToViewCourse(courseId, msg.sender),
            "Access denied: not authorized"
        );
        return courses[courseId].contentUris.length;
    }

    function updateCourseContent(
        uint256 courseId,
        string[] memory newContentUris
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can update content"
        );

        delete courses[courseId].contentUris;
        for (uint256 i = 0; i < newContentUris.length; i++) {
            require(
                bytes(newContentUris[i]).length > 0,
                "Content URI cannot be empty"
            );
            courses[courseId].contentUris.push(newContentUris[i]);
        }

        emit CourseContentUpdated(courseId, newContentUris);
    }

    function getCourse(uint256 courseId) external view returns (Course memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            _isAuthorizedToViewCourse(courseId, msg.sender),
            "Access denied: not authorized"
        );
        return courses[courseId];
    }

    function incrementEnrollment(uint256 courseId) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        courses[courseId].enrolledCount++;
    }

    function updateCourseRating(
        uint256 courseId,
        uint256 newRating
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(newRating <= 50, "Rating must be between 0 and 50");
        courses[courseId].rating = newRating;
    }

    function getAllCourseNames() external view returns (string[] memory) {
        string[] memory names = new string[](courseCount);
        for (uint256 i = 1; i <= courseCount; i++) {
            names[i - 1] = courses[i].title;
        }
        return names;
    }

    function getAllCourses()
        external
        view
        returns (
            string[] memory names,
            address[] memory instructors,
            uint256[] memory capacities,
            uint256[] memory enrolledStudents,
            string[] memory descriptions
        )
    {
        names = new string[](courseCount);
        instructors = new address[](courseCount);
        capacities = new uint256[](courseCount);
        enrolledStudents = new uint256[](courseCount);
        descriptions = new string[](courseCount);

        for (uint256 i = 1; i <= courseCount; i++) {
            names[i - 1] = courses[i].title;
            instructors[i - 1] = courses[i].instructor;
            capacities[i - 1] = courses[i].capacity;
            enrolledStudents[i - 1] = courses[i].enrolledCount;
            descriptions[i - 1] = courses[i].description;
        }
    }
}
