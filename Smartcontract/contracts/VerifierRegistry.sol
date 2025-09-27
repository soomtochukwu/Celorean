// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VerifierRegistry is Ownable, AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum VerificationStatus { None, Pending, Verified, Rejected }

    struct VerificationRecord {
        VerificationStatus status;
        string ref; // e.g., DID, profile ID, or attestation hash
        uint256 updatedAt;
        address verifier;
    }

    // subject => protocol => record
    mapping(address => mapping(string => VerificationRecord)) public records;

    event VerifierSet(address indexed account, bool enabled);
    event VerificationUpdated(address indexed subject, string protocol, VerificationStatus status, string ref);

    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function setVerifier(address account, bool enabled) external onlyOwner {
        if (enabled) {
            _grantRole(VERIFIER_ROLE, account);
        } else {
            _revokeRole(VERIFIER_ROLE, account);
        }
        emit VerifierSet(account, enabled);
    }

    function setVerification(
        address subject,
        string memory protocol,
        VerificationStatus status,
        string memory ref
    ) external onlyRole(VERIFIER_ROLE) {
        records[subject][protocol] = VerificationRecord({
            status: status,
            ref: ref,
            updatedAt: block.timestamp,
            verifier: msg.sender
        });
        emit VerificationUpdated(subject, protocol, status, ref);
    }

    function getVerification(address subject, string memory protocol) external view returns (VerificationRecord memory) {
        return records[subject][protocol];
    }

    function isVerified(address subject, string memory protocol) external view returns (bool) {
        return records[subject][protocol].status == VerificationStatus.Verified;
    }
}