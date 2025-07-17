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
    }

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
    
    function __CourseModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }
    
    function createCourse(
        string memory title,
        uint256 duration,
        string memory description,
        uint256 price,
        string[] memory tags,
        string memory level,
        string memory metadataUri
    ) public virtual returns (uint256) {
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
            metadataUri: metadataUri
        });
        
        courseNameToId[title] = courseId;
        
        emit CourseCreated(courseId, title, msg.sender, price, metadataUri);
        return courseId;
    }
    
    function getCourse(uint256 courseId) external view returns (Course memory) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        return courses[courseId];
    }
    
    function incrementEnrollment(uint256 courseId) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        courses[courseId].enrolledCount++;
    }
    
    function updateCourseRating(uint256 courseId, uint256 newRating) public virtual {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(newRating <= 50, "Rating must be between 0 and 50");
        courses[courseId].rating = newRating;
    }
}