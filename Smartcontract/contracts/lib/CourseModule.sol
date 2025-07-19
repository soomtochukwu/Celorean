// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CourseModule is Initializable {
    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 duration; // in weeks
        uint256 price; // in wei
        string[] tags;
        string level; // Beginner, Intermediate, Advanced
        uint256 rating; // out of 50 (4.7 = 47)
        uint256 enrolledCount;
        address instructor;
        string metadataUri; // IPFS URI for course metadata
        // ✅ Change to array of content URIs
        string[] contentUris; // Array of IPFS URIs for course content
    }

    // ✅ Updated event for content updates
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
    mapping(uint256 => Course) public courses;
    mapping(string => uint256) public courseNameToId;

    event CourseCreated(
        uint256 indexed courseId,
        string title,
        address indexed instructor,
        uint256 price,
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

    function __CourseModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }

    // ✅ New function to add single content URI
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
        emit CourseContentAdded(courseId, newContentUri, courses[courseId].contentUris.length - 1);
    }

    // ✅ New function to add multiple content URIs
    function addMultipleCourseContent(
        uint256 courseId,
        string[] memory newContentUris
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can add content"
        );
        require(newContentUris.length > 0, "Content URIs array cannot be empty");

        for (uint256 i = 0; i < newContentUris.length; i++) {
            require(bytes(newContentUris[i]).length > 0, "Content URI cannot be empty");
            courses[courseId].contentUris.push(newContentUris[i]);
        }
        
        emit CourseContentUpdated(courseId, courses[courseId].contentUris);
    }

    // ✅ Function to get all content URIs for a course
    function getCourseContentUris(uint256 courseId) external view returns (string[] memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        return courses[courseId].contentUris;
    }

    // ✅ Function to get content URI count
    function getCourseContentCount(uint256 courseId) external view returns (uint256) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        return courses[courseId].contentUris.length;
    }

    // ✅ Replace the old updateCourseContent function
    function updateCourseContent(
        uint256 courseId,
        string[] memory newContentUris
    ) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(
            courses[courseId].instructor == msg.sender,
            "Only course instructor can update content"
        );

        // Clear existing content URIs
        delete courses[courseId].contentUris;
        
        // Add new content URIs
        for (uint256 i = 0; i < newContentUris.length; i++) {
            require(bytes(newContentUris[i]).length > 0, "Content URI cannot be empty");
            courses[courseId].contentUris.push(newContentUris[i]);
        }
        
        emit CourseContentUpdated(courseId, newContentUris);
    }

    function getCourse(uint256 courseId) external view returns (Course memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
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
}
