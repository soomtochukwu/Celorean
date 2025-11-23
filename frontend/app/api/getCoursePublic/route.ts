import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, defineChain } from "viem";
import { localhost, celo } from "viem/chains";
import { getAddressesForEnvironment } from "@/contracts";

// Define Celo Sepolia chain
const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/celo_sepolia'],
    },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
});

// Network configuration mapping (duplicate kept local to avoid shared module coupling)
const NETWORK_CONFIGS = {
  localhost: {
    chain: localhost,
    rpcUrl: "http://127.0.0.1:8545",
  },
  celoSepolia: {
    chain: celoSepolia,
    rpcUrl: "https://rpc.ankr.com/celo_sepolia",
  },
  "celo-sepolia": {
    chain: celoSepolia,
    rpcUrl: "https://rpc.ankr.com/celo_sepolia",
  },
  celo: {
    chain: celo,
    rpcUrl: "https://celo.drpc.org",
  },
  "celo-mainnet": {
    chain: celo,
    rpcUrl: "https://celo.drpc.org",
  },
} as const;

type NetworkName = keyof typeof NETWORK_CONFIGS;

type Environment = 'localhost' | 'testnet' | 'mainnet';

function getNetworkConfig(name?: string) {
  const raw = (name || "localhost");
  const normalized = raw === 'testnet' ? 'celoSepolia' : raw === 'mainnet' ? 'celo' : raw;
  const key = normalized as NetworkName;
  return NETWORK_CONFIGS[key] || NETWORK_CONFIGS.localhost;
}

function mapNetworkToEnvironment(name?: string): Environment {
  switch (name) {
    case "celo":
    case "celo-mainnet":
    case "mainnet":
      return "mainnet";
    case "celoSepolia":
    case "celo-sepolia":
    case "testnet":
      return "testnet";
    default:
      return "localhost";
  }
}

// Match the on-chain event exactly (includes title)
const CourseCreatedEvent = parseAbiItem(
  'event CourseCreated(uint256 indexed courseId, string title, address indexed instructor, string metadataUri)'
);

// POST to fetch public preview data for a course via logs (no authorization required)
export async function POST(request: NextRequest) {
  try {
    const { courseId, network: requestNetwork } = await request.json();

    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
    }

    const env = mapNetworkToEnvironment(requestNetwork);
    const addresses = getAddressesForEnvironment(env);

    if (!addresses) {
      return NextResponse.json(
        { error: `No contract addresses configured for ${env}` },
        { status: 400 }
      );
    }

    const selectedNetworkConfig = getNetworkConfig(requestNetwork);

    const client = createPublicClient({
      chain: selectedNetworkConfig.chain,
      transport: http(selectedNetworkConfig.rpcUrl),
    });

    // Query logs for CourseCreated for this courseId
    // Limit block range to avoid "Block range is too large" error on public RPCs
    const blockNumber = await client.getBlockNumber();
    const fromBlock = blockNumber - BigInt(1000) > BigInt(0) ? blockNumber - BigInt(1000) : BigInt(0);

    const logs = await client.getLogs({
      address: addresses.proxyAddress as `0x${string}`,
      event: CourseCreatedEvent,
      args: { courseId: BigInt(courseId) },
      fromBlock: fromBlock,
      toBlock: 'latest',
      strict: true,
    });

    if (!logs.length) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Take the latest occurrence (in case of re-emits in upgrades)
    const last = logs[logs.length - 1];
    const { title: eventTitle, instructor, metadataUri } = last.args as {
      courseId: bigint; title: string; instructor: `0x${string}`; metadataUri: string;
    };

    // Optionally fetch metadata to surface title/thumbnail if available
    let meta: any = undefined;
    if (metadataUri && typeof metadataUri === 'string') {
      try {
        const res = await fetch(metadataUri);
        if (res.ok) meta = await res.json();
      } catch {}
    }

    // Return a minimal, public preview shape
    const preview = {
      id: courseId,
      instructor,
      price: "0", // Price removed from contract, defaulting to 0/Free
      metadataUri,
      // Best-effort enrichment from metadata (if present)
      title: meta?.title ?? eventTitle ?? undefined,
      description: meta?.description ?? undefined,
      level: meta?.level ?? undefined,
      tags: meta?.tags ?? undefined,
      thumbnail: meta?.thumbnail ?? undefined,
    };

    return NextResponse.json(preview);
  } catch (error: any) {
    console.error('Error fetching public course preview:', error);
    const reason = error?.shortMessage || error?.message || 'Failed to fetch public course preview';
    return NextResponse.json({ error: reason }, { status: 500 });
  }
}