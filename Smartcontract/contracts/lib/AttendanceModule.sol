// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AttendanceModule is Initializable {
    struct ClassSession {
        uint256 id;
        uint256 courseId;
        uint256 timestamp;
        bool marked;
    }

    mapping(uint256 => ClassSession) public classSessions;
    mapping(address => mapping(uint256 => uint256))
        public studentSessionAttendance;
    uint256 private _sessionIdCounter;

    mapping(uint256 => uint256[]) internal courseSessions;
    mapping(address => uint256[]) public lecturerSessions;

    event ClassSessionCreated(
        uint256 indexed sessionId,
        uint256 indexed courseId,
        uint256 timestamp
    );
    event AttendanceMarked(uint256 indexed sessionId, address indexed student);

    function __AttendanceModule_init() internal onlyInitializing {
        _sessionIdCounter = 0;
    }

    function createClassSession(
        uint256 courseId
    ) public virtual returns (uint256) {
        _sessionIdCounter++;
        uint256 sessionId = _sessionIdCounter;

        classSessions[sessionId] = ClassSession({
            id: sessionId,
            courseId: courseId,
            timestamp: block.timestamp,
            marked: false
        });

        courseSessions[courseId].push(sessionId);
        lecturerSessions[msg.sender].push(sessionId);

        emit ClassSessionCreated(sessionId, courseId, block.timestamp);
        return sessionId;
    }

    function markAttendance(uint256 sessionId, address student) public virtual {
        require(classSessions[sessionId].courseId > 0, "Session not found");
        require(
            studentSessionAttendance[student][sessionId] == 0,
            "Attendance already marked"
        );
        studentSessionAttendance[student][sessionId] = 1;
        emit AttendanceMarked(sessionId, student);
    }

    function getSessionsForCourse(
        uint256 courseId
    ) public view returns (uint256[] memory) {
        return courseSessions[courseId];
    }

    function getSessionIdsForLecturer()
        external
        view
        returns (uint256[] memory)
    {
        return lecturerSessions[msg.sender];
    }
}
