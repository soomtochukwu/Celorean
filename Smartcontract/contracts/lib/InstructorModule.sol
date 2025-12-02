// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract InstructorModule is Initializable {
    mapping(address => uint256) public lecturers;
    address[] public lecturerList;

    event LecturerEmployed(address indexed lecturer);

    function __InstructorModule_init() internal onlyInitializing {
        // Initialization logic without ownership
    }

    function _employLecturer(address lecturer) internal {
        require(lecturers[lecturer] == 0, "Lecturer already exists");
        lecturers[lecturer] = 1; // Use 1 as default active status
        lecturerList.push(lecturer);
        emit LecturerEmployed(lecturer);
    }

    function isLecturer(address account) external view returns (bool) {
        return lecturers[account] > 0;
    }

    function getLecturerList() external view returns (address[] memory) {
        return lecturerList;
    }
}
