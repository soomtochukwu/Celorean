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
