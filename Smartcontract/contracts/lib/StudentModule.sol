// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StudentModule is Initializable {
    mapping(address => uint256) public studentTokens;
    mapping(address => bool) public isStudent;
    address[] public students;

    event StudentAdmitted(address indexed student);
    event StudentTokenUpdated(address indexed student, uint256 newAmount);

    function __StudentModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }

    function _admitStudent(address student) internal {
        require(!isStudent[student], "Student already exists");
        studentTokens[student] = 0; // Initialize with 0 tokens
        isStudent[student] = true;
        students.push(student);
        emit StudentAdmitted(student);
    }

    function _addStudentTokens(address student, uint256 amount) internal {
        require(isStudent[student], "Not a student");
        studentTokens[student] += amount;
        emit StudentTokenUpdated(student, studentTokens[student]);
    }

    function getListOfStudents() external view returns (address[] memory) {
        return students;
    }
}
