// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EnrollmentModule is Initializable {
    mapping(address => uint256[]) public studentCourses;
    mapping(uint256 => address[]) public courseStudents;
    
    event StudentRegistered(uint256 courseId, address student);
    
    function __EnrollmentModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }
    
    function registerForCourse(uint256 courseId, address student) public virtual payable {
        studentCourses[student].push(courseId);
        courseStudents[courseId].push(student);
        emit StudentRegistered(courseId, student);
    }
    
    function getStudentCourses(address student) external view returns (uint256[] memory) {
        return studentCourses[student];
    }
    
    function getCourseStudents(uint256 courseId) external view returns (address[] memory) {
        return courseStudents[courseId];
    }
}