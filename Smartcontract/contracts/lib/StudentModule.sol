// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StudentModule is Initializable {
    mapping(address => uint256) public studentTokens;
    mapping(address => bool) public isStudent;
    address[] public students;
    
    event StudentAdmitted(address indexed student, uint256 amount);
    
    function __StudentModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }
    
    function admitStudent(address student, uint256 amount) external {
        require(!isStudent[student], "Student already exists");
        studentTokens[student] = amount;
        isStudent[student] = true;
        students.push(student);
        emit StudentAdmitted(student, amount);
    }
    
    function getListOfStudents() external view returns (address[] memory) {
        return students;
    }
}