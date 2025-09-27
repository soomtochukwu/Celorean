// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateNFT is ERC721, Ownable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIdCounter;

    // credentialId => tokenId
    mapping(uint256 => uint256) public credentialCertificate;
    // tokenId => credentialId (0 if not linked)
    mapping(uint256 => uint256) public certificateCredential;
    // tokenId => tokenURI
    mapping(uint256 => string) private _tokenURIs;

    event CertificateMinted(uint256 indexed tokenId, address indexed to, uint256 credentialId, string title, string metadataUri);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _tokenIdCounter = 0;
    }

    // Resolve multiple inheritance of supportsInterface (ERC721 + AccessControl)
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setMinter(address account, bool enabled) external onlyOwner {
        if (enabled) _grantRole(MINTER_ROLE, account); else _revokeRole(MINTER_ROLE, account);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // OpenZeppelin v5 removed _exists; use ownerOf() revert semantics to ensure minted
        ownerOf(tokenId); // will revert if token does not exist
        return _tokenURIs[tokenId];
    }

    // Mint certificate linked to a credentialId from Celorean
    function mintCertificateForCredential(
        address to,
        uint256 credentialId,
        string memory title,
        string memory metadataUri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(credentialId > 0, "Invalid credentialId");
        require(credentialCertificate[credentialId] == 0, "Already minted for credential");

        _tokenIdCounter += 1;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataUri;

        credentialCertificate[credentialId] = tokenId;
        certificateCredential[tokenId] = credentialId;

        emit CertificateMinted(tokenId, to, credentialId, title, metadataUri);
        return tokenId;
    }

    // General certificate mint (e.g., for EventManager without Celorean credential)
    function mintCertificate(
        address to,
        string memory title,
        string memory metadataUri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(title).length > 0, "Title required");

        _tokenIdCounter += 1;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataUri;

        emit CertificateMinted(tokenId, to, 0, title, metadataUri);
        return tokenId;
    }
}