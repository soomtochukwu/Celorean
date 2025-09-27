// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICertificateNFT_EM {
    function mintCertificate(
        address to,
        string memory title,
        string memory metadataUri
    ) external returns (uint256);
}

contract EventManager is Ownable, AccessControl {
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    struct EventData {
        uint256 id;
        string title;
        string description;
        string category;
        string metadataUri; // image or JSON metadata
        address organizer;
        uint256 priceWei;
        uint256 capacity;
        uint64 startTime;
        uint64 endTime;
        uint32 registeredCount;
        bool isCompleted;
    }

    uint256 public eventCount;
    mapping(uint256 => EventData) public eventsById;
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => address[]) public registrants;

    address public certificateNFT;
    event CertificateNFTSet(address indexed nft);
    event EventCreated(uint256 indexed eventId, string title, address indexed organizer);
    event EventUpdated(uint256 indexed eventId);
    event Registered(uint256 indexed eventId, address indexed attendee);
    event EventCompleted(uint256 indexed eventId);
    event CertificateIssued(uint256 indexed eventId, address indexed attendee, uint256 tokenId);

    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
    }

    function setCertificateNFT(address nft) external onlyOwner {
        require(nft != address(0), "Invalid NFT");
        certificateNFT = nft;
        emit CertificateNFTSet(nft);
    }

    // Organizer management
    function setOrganizer(address account, bool enabled) external onlyOwner {
        if (enabled) _grantRole(ORGANIZER_ROLE, account); else _revokeRole(ORGANIZER_ROLE, account);
    }

    function createEvent(
        string memory title,
        string memory description,
        string memory category,
        string memory metadataUri,
        uint256 priceWei,
        uint256 capacity,
        uint64 startTime,
        uint64 endTime
    ) external onlyRole(ORGANIZER_ROLE) returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(endTime == 0 || endTime >= startTime, "Invalid times");

        eventCount += 1;
        uint256 eventId = eventCount;

        eventsById[eventId] = EventData({
            id: eventId,
            title: title,
            description: description,
            category: category,
            metadataUri: metadataUri,
            organizer: msg.sender,
            priceWei: priceWei,
            capacity: capacity,
            startTime: startTime,
            endTime: endTime,
            registeredCount: 0,
            isCompleted: false
        });

        emit EventCreated(eventId, title, msg.sender);
        return eventId;
    }

    function updateEvent(
        uint256 eventId,
        string memory title,
        string memory description,
        string memory category,
        string memory metadataUri,
        uint256 priceWei,
        uint256 capacity,
        uint64 startTime,
        uint64 endTime
    ) external onlyRole(ORGANIZER_ROLE) {
        EventData storage ev = eventsById[eventId];
        require(ev.organizer == msg.sender, "Not organizer");
        ev.title = title;
        ev.description = description;
        ev.category = category;
        ev.metadataUri = metadataUri;
        ev.priceWei = priceWei;
        ev.capacity = capacity;
        ev.startTime = startTime;
        ev.endTime = endTime;
        emit EventUpdated(eventId);
    }

    function register(uint256 eventId) external payable {
        EventData storage ev = eventsById[eventId];
        require(ev.id != 0, "Event not found");
        require(!isRegistered[eventId][msg.sender], "Already registered");
        require(ev.capacity == 0 || ev.registeredCount < ev.capacity, "Capacity reached");
        require(msg.value >= ev.priceWei, "Insufficient payment");

        isRegistered[eventId][msg.sender] = true;
        registrants[eventId].push(msg.sender);
        ev.registeredCount += 1;

        // Refund excess
        if (msg.value > ev.priceWei) {
            payable(msg.sender).transfer(msg.value - ev.priceWei);
        }
        emit Registered(eventId, msg.sender);
    }

    function completeEvent(uint256 eventId) external onlyRole(ORGANIZER_ROLE) {
        EventData storage ev = eventsById[eventId];
        require(ev.organizer == msg.sender, "Not organizer");
        ev.isCompleted = true;
        emit EventCompleted(eventId);
    }

    function issueCertificateToAttendee(uint256 eventId, address attendee) external onlyRole(ORGANIZER_ROLE) returns (uint256) {
        EventData storage ev = eventsById[eventId];
        require(ev.organizer == msg.sender, "Not organizer");
        require(ev.isCompleted, "Event not completed");
        require(isRegistered[eventId][attendee], "Not registered");
        require(certificateNFT != address(0), "NFT not set");

        uint256 tokenId = ICertificateNFT_EM(certificateNFT).mintCertificate(
            attendee,
            string(abi.encodePacked(ev.title, " Certificate")),
            ev.metadataUri
        );
        emit CertificateIssued(eventId, attendee, tokenId);
        return tokenId;
    }

    // Withdraw event funds by organizer
    function withdraw(uint256 eventId) external onlyRole(ORGANIZER_ROLE) {
        EventData storage ev = eventsById[eventId];
        require(ev.organizer == msg.sender, "Not organizer");
        payable(msg.sender).transfer(address(this).balance);
    }

    // View helpers
    function getRegistrants(uint256 eventId) external view returns (address[] memory) {
        return registrants[eventId];
    }
}