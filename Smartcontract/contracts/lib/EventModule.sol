// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract EventModule is Initializable, AccessControlUpgradeable {
    // Event type categories
    enum EventType {
        Bootcamp,
        Seminar,
        Workshop,
        Hackathon
    }

    // Event format (Virtual or In Real Life)
    enum EventFormat {
        Virtual,
        IRL
    }

    // Event status
    enum EventStatus {
        Active,
        Cancelled,
        Completed
    }

    struct Event {
        uint256 id;
        address organizer;
        string metadataURI; // IPFS hash containing title, description, image, requirements, tags
        uint256 startTime; // Unix timestamp
        uint256 endTime; // Unix timestamp
        uint256 maxCapacity; // 0 for unlimited
        uint256 registeredCount;
        uint256 price; // In Wei (0 for free events)
        EventType eventType;
        EventFormat eventFormat;
        string locationData; // For Virtual: meeting link; For IRL: address or coordinates
        EventStatus status;
        uint256 courseId; // Optional course ID (0 means no associated course)
    }

    // Storage
    uint256 private eventCounter;
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => bool)) public eventRegistrations; // eventId => participant => registered
    mapping(uint256 => address[]) public eventParticipants; // eventId => array of participants
    mapping(address => uint256[]) public organizerEvents; // organizer => array of event IDs

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        EventType eventType,
        EventFormat eventFormat,
        uint256 startTime
    );

    event EventRegistered(
        uint256 indexed eventId,
        address indexed participant,
        uint256 pricePaid
    );

    event EventCancelled(uint256 indexed eventId, address indexed organizer);

    event EventCompleted(uint256 indexed eventId);

    event EventUpdated(
        uint256 indexed eventId,
        string metadataURI,
        uint256 startTime,
        uint256 endTime
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function __EventModule_init() internal onlyInitializing {
        __EventModule_init_unchained();
        __AccessControl_init();
    }

    function __EventModule_init_unchained() internal onlyInitializing {
        eventCounter = 0;
    }

    // Struct for creating events to avoid stack-too-deep errors
    struct CreateEventParams {
        string metadataURI;
        uint256 startTime;
        uint256 endTime;
        uint256 maxCapacity;
        uint256 price;
        EventType eventType;
        EventFormat eventFormat;
        string locationData;
        uint256 courseId;
    }

    /**
     * @notice Create a new event
     * @param params CreateEventParams struct containing all event details
     */
    function createEvent(
        CreateEventParams memory params
    ) external returns (uint256) {
        require(bytes(params.metadataURI).length > 0, "Metadata URI required");
        require(
            params.startTime > block.timestamp,
            "Start time must be in future"
        );
        require(
            params.endTime > params.startTime,
            "End time must be after start time"
        );
        require(
            bytes(params.locationData).length > 0,
            "Location data required"
        );

        uint256 eventId = eventCounter++;

        events[eventId] = Event({
            id: eventId,
            organizer: msg.sender,
            metadataURI: params.metadataURI,
            startTime: params.startTime,
            endTime: params.endTime,
            maxCapacity: params.maxCapacity,
            registeredCount: 0,
            price: params.price,
            eventType: params.eventType,
            eventFormat: params.eventFormat,
            locationData: params.locationData,
            status: EventStatus.Active,
            courseId: params.courseId
        });

        organizerEvents[msg.sender].push(eventId);

        emit EventCreated(
            eventId,
            msg.sender,
            params.eventType,
            params.eventFormat,
            params.startTime
        );

        return eventId;
    }

    /**
     * @notice Register for an event
     * @param eventId The ID of the event to register for
     */
    function registerForEvent(uint256 eventId) external payable {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.status == EventStatus.Active, "Event is not active");
        require(
            block.timestamp < evt.startTime,
            "Registration closed (event started)"
        );
        require(!eventRegistrations[eventId][msg.sender], "Already registered");
        require(
            evt.maxCapacity == 0 || evt.registeredCount < evt.maxCapacity,
            "Event is full"
        );
        require(msg.value >= evt.price, "Insufficient payment");

        // Record registration
        eventRegistrations[eventId][msg.sender] = true;
        eventParticipants[eventId].push(msg.sender);
        evt.registeredCount++;

        // Transfer payment to organizer
        if (evt.price > 0) {
            (bool success, ) = evt.organizer.call{value: evt.price}("");
            require(success, "Payment transfer failed");

            // Refund excess payment
            if (msg.value > evt.price) {
                (bool refundSuccess, ) = msg.sender.call{
                    value: msg.value - evt.price
                }("");
                require(refundSuccess, "Refund failed");
            }
        }

        emit EventRegistered(eventId, msg.sender, evt.price);
    }

    /**
     * @notice Cancel an event (organizer only)
     * @param eventId The ID of the event to cancel
     */
    function cancelEvent(uint256 eventId) external {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.organizer == msg.sender, "Only organizer can cancel");
        require(evt.status == EventStatus.Active, "Event is not active");

        evt.status = EventStatus.Cancelled;

        emit EventCancelled(eventId, msg.sender);
    }

    /**
     * @notice Mark event as completed (organizer only, after end time)
     * @param eventId The ID of the event to complete
     */
    function completeEvent(uint256 eventId) external {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.organizer == msg.sender, "Only organizer can complete");
        require(evt.status == EventStatus.Active, "Event is not active");
        require(block.timestamp >= evt.endTime, "Event has not ended yet");

        evt.status = EventStatus.Completed;

        emit EventCompleted(eventId);
    }

    /**
     * @notice Update event details (organizer only, before start time)
     * @param eventId The ID of the event to update
     * @param metadataURI New metadata URI
     * @param startTime New start time
     * @param endTime New end time
     */
    function updateEvent(
        uint256 eventId,
        string memory metadataURI,
        uint256 startTime,
        uint256 endTime
    ) external {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.organizer == msg.sender, "Only organizer can update");
        require(evt.status == EventStatus.Active, "Event is not active");
        require(
            block.timestamp < evt.startTime,
            "Cannot update after event started"
        );
        require(startTime > block.timestamp, "Start time must be in future");
        require(endTime > startTime, "End time must be after start time");

        if (bytes(metadataURI).length > 0) {
            evt.metadataURI = metadataURI;
        }

        evt.startTime = startTime;
        evt.endTime = endTime;

        emit EventUpdated(eventId, metadataURI, startTime, endTime);
    }

    /**
     * @notice Get event details
     * @param eventId The ID of the event
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].id == eventId, "Event does not exist");
        return events[eventId];
    }

    /**
     * @notice Check if an address is registered for an event
     * @param eventId The ID of the event
     * @param participant The address to check
     */
    function isRegistered(
        uint256 eventId,
        address participant
    ) external view returns (bool) {
        return eventRegistrations[eventId][participant];
    }

    /**
     * @notice Get all participants for an event
     * @param eventId The ID of the event
     */
    function getEventParticipants(
        uint256 eventId
    ) external view returns (address[] memory) {
        return eventParticipants[eventId];
    }

    /**
     * @notice Get all events created by an organizer
     * @param organizer The address of the organizer
     */
    function getOrganizerEvents(
        address organizer
    ) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }

    /**
     * @notice Get total number of events created
     */
    function getTotalEvents() external view returns (uint256) {
        return eventCounter;
    }

    /**
     * @notice Get event registration count
     * @param eventId The ID of the event
     */
    function getEventRegistrationCount(
        uint256 eventId
    ) external view returns (uint256) {
        return events[eventId].registeredCount;
    }

    /**
     * @notice Issue certificate NFT to event attendee (organizer only, after event completion)
     * @param eventId The ID of the event
     * @param attendee The address of the attendee
     * @param certificateNFT The address of the CertificateNFT contract
     */
    function issueCertificateToAttendee(
        uint256 eventId,
        address attendee,
        address certificateNFT
    ) external returns (uint256) {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.organizer == msg.sender, "Only organizer can issue");
        require(evt.status == EventStatus.Completed, "Event not completed");
        require(eventRegistrations[eventId][attendee], "Not registered");
        require(certificateNFT != address(0), "NFT contract not set");

        // Call CertificateNFT contract to mint
        (bool success, bytes memory data) = certificateNFT.call(
            abi.encodeWithSignature(
                "mintCertificate(address,string,string)",
                attendee,
                "Event Attendance Certificate",
                evt.metadataURI
            )
        );
        require(success, "Certificate minting failed");

        uint256 tokenId = abi.decode(data, (uint256));

        emit CertificateIssued(eventId, attendee, tokenId);
        return tokenId;
    }

    /**
     * @notice Withdraw event registration fees (organizer only)
     * @param eventId The ID of the event
     */
    function withdrawEventFunds(uint256 eventId) external {
        Event storage evt = events[eventId];

        require(evt.id == eventId, "Event does not exist");
        require(evt.organizer == msg.sender, "Only organizer can withdraw");

        // Calculate total funds for this event
        uint256 totalFunds = evt.price * evt.registeredCount;
        require(totalFunds > 0, "No funds to withdraw");
        require(address(this).balance >= totalFunds, "Insufficient balance");

        (bool success, ) = msg.sender.call{value: totalFunds}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(eventId, msg.sender, totalFunds);
    }

    // Additional events
    event CertificateIssued(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 tokenId
    );
    event FundsWithdrawn(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 amount
    );

    /**
     * @dev Gap for future storage variables (upgradeable pattern)
     */
    uint256[50] private __gap;
}
