import { useMemo } from "react";
import {
  useReadContract,
  useReadContracts,
} from "wagmi";
import EventManagerABI from "../contracts/EventManager.json";
import { useNetworkAddresses, useNetworkConfig } from "@/contexts/NetworkContext";
import { handleNetworkError, createContractAddressError } from "@/utils/network-error-handler";

export type OnChainEvent = {
  id: number;
  title: string;
  description: string;
  category: string;
  metadataUri: string;
  organizer: string;
  priceWei: bigint;
  capacity: bigint;
  startTime: bigint;
  endTime: bigint;
  registeredCount: bigint;
  isCompleted: boolean;
};

export type UIEventItem = {
  id: string;
  title: string;
  date: string; // ISO
  time?: string; // HH:mm
  location: string;
  category: string;
  price?: string;
  image?: string;
  organizer?: string;
  attendeesCount?: number;
  isPublished?: boolean;
  tags?: string[];
};

function ipfsToHttp(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return uri;
}

function formatPrice(wei: bigint | undefined): string | undefined {
  if (wei === undefined) return undefined;
  if (wei === BigInt(0)) return "Free";
  // Display in CELO with 18 decimals, truncated
  const celo = Number(wei) / 1e18;
  if (!isFinite(celo)) return undefined;
  return `${celo.toFixed(3)} CELO`;
}

export default function useEventManager() {
  let currentAddresses;
  try {
    currentAddresses = useNetworkAddresses();
  } catch (error) {
    handleNetworkError(error);
    throw error;
  }
  const networkConfig = useNetworkConfig();
  void networkConfig; // currently unused but kept for parity

  const EVENT_MANAGER_ADDRESS = currentAddresses?.eventManager;

  if (!EVENT_MANAGER_ADDRESS) {
    const addressError = createContractAddressError("EventManager");
    // Do not throw here to allow pages to render gracefully; return empty dataset instead
    // However, consumers may check for address presence to display helpful UI.
  }

  // Read event count
  const { data: countData } = useReadContract({
    address: EVENT_MANAGER_ADDRESS as `0x${string}` | undefined,
    abi: (EventManagerABI as any).abi,
    functionName: "eventCount",
    query: {
      enabled: Boolean(EVENT_MANAGER_ADDRESS),
    },
  } as any);

  const eventCount = useMemo(() => Number(countData || 0), [countData]);

  // Build batched calls for eventsById(1..eventCount)
  const eventContracts = useMemo(() => {
    if (!EVENT_MANAGER_ADDRESS || !eventCount) return [] as any[];
    return Array.from({ length: eventCount }, (_, i) => ({
      address: EVENT_MANAGER_ADDRESS as `0x${string}`,
      abi: (EventManagerABI as any).abi,
      functionName: "eventsById",
      args: [BigInt(i + 1)],
    }));
  }, [EVENT_MANAGER_ADDRESS, eventCount]);

  const {
    data: eventsResults,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch,
  } = useReadContracts({
    allowFailure: true,
    contracts: eventContracts as any,
    query: {
      enabled: Boolean(EVENT_MANAGER_ADDRESS) && eventContracts.length > 0,
    },
  } as any);

  const onChainEvents: OnChainEvent[] = useMemo(() => {
    if (!eventsResults || !Array.isArray(eventsResults)) return [];
    return eventsResults
      .map((res, idx) => {
        const r: any = res;
        if (!r || r.status === "failure" || !r.result) return null;
        const tuple = r.result as any[];
        if (!tuple || tuple.length < 12) return null;
        const [
          id,
          title,
          description,
          category,
          metadataUri,
          organizer,
          priceWei,
          capacity,
          startTime,
          endTime,
          registeredCount,
          isCompleted,
        ] = tuple as [
          bigint,
          string,
          string,
          string,
          string,
          string,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          boolean
        ];
        return {
          id: Number(id),
          title,
          description,
          category,
          metadataUri,
          organizer,
          priceWei,
          capacity,
          startTime,
          endTime,
          registeredCount,
          isCompleted,
        } as OnChainEvent;
      })
      .filter(Boolean) as OnChainEvent[];
  }, [eventsResults]);

  const uiEvents: UIEventItem[] = useMemo(() => {
    return onChainEvents.map((ev) => {
      const date = new Date(Number(ev.startTime) * 1000);
      const time = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date);
      return {
        id: String(ev.id),
        title: ev.title,
        date: date.toISOString(),
        time,
        location: "Online",
        category: ev.category || "General",
        price: formatPrice(ev.priceWei),
        image: ipfsToHttp(ev.metadataUri) || "/placeholder.svg",
        organizer: ev.organizer,
        attendeesCount: Number((ev.registeredCount ?? BigInt(0))),
        isPublished: !ev.isCompleted,
        tags: ev.category ? [ev.category] : [],
      } as UIEventItem;
    });
  }, [onChainEvents]);

  return {
    address: EVENT_MANAGER_ADDRESS as string | undefined,
    eventCount,
    onChainEvents,
    events: uiEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch,
  };
}