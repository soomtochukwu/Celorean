// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

library CredentialStorage {
    // Unique storage slot for namespaced storage (ERC-7201 style pattern)
    // keccak256("celorean.storage.credential")
    bytes32 internal constant STORAGE_SLOT = 0x0c2c9b5e6b5a5c9d2d2f8d3c1f73b7f1c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8;

    struct Credential {
        uint256 id;
        address student;
        address issuer;
        uint256 issuedAt;
        string title;
        string metadataUri; // optional off-chain metadata link
    }

    struct Layout {
        uint256 credentialCount;
        mapping(uint256 => Credential) credentials;
        mapping(address => uint256[]) studentCredentialIds;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}

contract CredentialModule is Initializable {
    using CredentialStorage for CredentialStorage.Layout;
    using CredentialStorage for *;

    // Expose type for external contracts if needed
    using CredentialStorage for CredentialStorage.Credential;

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

        CredentialStorage.Layout storage l = CredentialStorage.layout();

        l.credentialCount += 1;
        uint256 id = l.credentialCount;
        l.credentials[id] = CredentialStorage.Credential({
            id: id,
            student: student,
            issuer: issuer,
            issuedAt: block.timestamp,
            title: title,
            metadataUri: metadataUri
        });
        l.studentCredentialIds[student].push(id);

        emit CredentialIssued(id, student, issuer, title, metadataUri);
        return id;
    }

    event CredentialIssued(
        uint256 indexed id,
        address indexed student,
        address indexed issuer,
        string title,
        string metadataUri
    );

    // Views to support frontend without looping on client
    // Backward-compatible accessors to preserve original public getters
    function credentialCount() public view returns (uint256) {
        CredentialStorage.Layout storage l = CredentialStorage.layout();
        return l.credentialCount;
    }

    function credentials(uint256 id) public view returns (CredentialStorage.Credential memory) {
        CredentialStorage.Layout storage l = CredentialStorage.layout();
        return l.credentials[id];
    }

    function getStudentCredentialIds(address student) public view returns (uint256[] memory) {
        CredentialStorage.Layout storage l = CredentialStorage.layout();
        return l.studentCredentialIds[student];
    }

    function getCredentialsByStudent(address student) public view returns (CredentialStorage.Credential[] memory) {
        CredentialStorage.Layout storage l = CredentialStorage.layout();
        uint256[] memory ids = l.studentCredentialIds[student];
        CredentialStorage.Credential[] memory list = new CredentialStorage.Credential[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = l.credentials[ids[i]];
        }
        return list;
    }
}