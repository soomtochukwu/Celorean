// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CredentialModule is Initializable {
    struct Credential {
        uint256 id;
        address student;
        address issuer;
        uint256 issuedAt;
        string title;
        string metadataUri; // optional off-chain metadata link
    }

    event CredentialIssued(
        uint256 indexed id,
        address indexed student,
        address indexed issuer,
        string title,
        string metadataUri
    );

    uint256 public credentialCount;
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) internal studentCredentialIds;

    function __CredentialModule_init() internal onlyInitializing {}

    // Internal issuance primitive used by the main contract with access controls
    function _issueCredential(
        address student,
        address issuer,
        string memory title,
        string memory metadataUri
    ) internal returns (uint256) {
        require(student != address(0), "Invalid student");
        require(bytes(title).length > 0, "Title required");

        credentialCount += 1;
        uint256 id = credentialCount;
        credentials[id] = Credential({
            id: id,
            student: student,
            issuer: issuer,
            issuedAt: block.timestamp,
            title: title,
            metadataUri: metadataUri
        });
        studentCredentialIds[student].push(id);

        emit CredentialIssued(id, student, issuer, title, metadataUri);
        return id;
    }

    // Views to support frontend without looping on client
    function getCredential(uint256 id) public view returns (Credential memory) {
        require(id > 0 && id <= credentialCount, "Invalid credential id");
        return credentials[id];
    }

    function getStudentCredentialIds(address student) public view returns (uint256[] memory) {
        return studentCredentialIds[student];
    }

    function getCredentialsByStudent(address student) public view returns (Credential[] memory) {
        uint256[] memory ids = studentCredentialIds[student];
        Credential[] memory list = new Credential[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = credentials[ids[i]];
        }
        return list;
    }
}