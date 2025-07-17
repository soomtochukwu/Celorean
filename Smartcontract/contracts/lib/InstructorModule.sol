// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract InstructorModule is Initializable {
    mapping(address => uint256) public lecturers;
    address[] public lecturerList;
    
    event LecturerEmployed(address indexed lecturer, uint256 amount);
    
    function __InstructorModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }
    
    function employLecturer(address lecturer, uint256 value) external {
        require(lecturers[lecturer] == 0, "Lecturer already exists");
        lecturers[lecturer] = value;
        lecturerList.push(lecturer);
        emit LecturerEmployed(lecturer, value);
    }
    
    function isLecturer(address account) external view returns (bool) {
        return lecturers[account] > 0;
    }
    
    function getLecturerList() external view returns (address[] memory) {
        return lecturerList;
    }
}