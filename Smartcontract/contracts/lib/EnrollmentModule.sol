// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EnrollmentModule is Initializable {
    mapping(address => uint256[]) public studentCourses;
    mapping(uint256 => address[]) public courseStudents;
    // NEW STORAGE VARIABLES MUST BE ADDED AFTER EXISTING ONES
    mapping(uint256 => mapping(address => bool)) public isEnrolled;

    event StudentRegistered(uint256 courseId, address student);

    function __EnrollmentModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }

    function registerForCourse(
        uint256 courseId,
        address student
    ) public virtual {
        // Add duplicate enrollment check
        require(
            !isEnrolled[courseId][student],
            "Student already enrolled in this course"
        );

        studentCourses[student].push(courseId);
        courseStudents[courseId].push(student);
        isEnrolled[courseId][student] = true; // Mark as enrolled
        emit StudentRegistered(courseId, student);
    }

    function getStudentCourses(
        address student
    ) external view returns (uint256[] memory) {
        return studentCourses[student];
    }

    function getCourseStudents(
        uint256 courseId
    ) external view returns (address[] memory) {
        return courseStudents[courseId];
    }

    // Add function to check enrollment status
    function isStudentEnrolled(
        uint256 courseId,
        address student
    ) external view returns (bool) {
        return isEnrolled[courseId][student];
    }

    function getCoursesRegisteredByStudent(
        address student
    ) external view returns (uint256[] memory) {
        return studentCourses[student];
    }

    function getTotalRegisteredCourses() external view returns (uint256) {
        return studentCourses[msg.sender].length;
    }
}
