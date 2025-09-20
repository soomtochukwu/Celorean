import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { localhost, celoAlfajores, celo, lisk, liskSepolia } from "viem/chains";
import { getAddressesForEnvironment } from "@/contracts";

// Network configuration mapping (duplicate kept local to avoid shared module coupling)
const NETWORK_CONFIGS = {
  localhost: {
    chain: localhost,
    rpcUrl: "http://127.0.0.1:8545",
  },
  alfajores: {
    chain: celoAlfajores,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
  },
  "celo-alfajores": {
    chain: celoAlfajores,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
  },
  celo: {
    chain: celo,
    rpcUrl: "https://forno.celo.org",
  },
  "celo-mainnet": {
    chain: celo,
    rpcUrl: "https://forno.celo.org",
  },
  lisk: {
    chain: lisk,
    rpcUrl: "https://rpc.api.lisk.com",
  },
  liskSepolia: {
    chain: liskSepolia,
    rpcUrl: "https://rpc.sepolia-api.lisk.com",
  },
} as const;

type NetworkName = keyof typeof NETWORK_CONFIGS;

type Environment = 'localhost' | 'testnet' | 'mainnet';

function getNetworkConfig(name?: string) {
  const raw = (name || "localhost");
  const normalized = raw === 'testnet' ? 'alfajores' : raw === 'mainnet' ? 'celo' : raw;
  const key = normalized as NetworkName;
  return NETWORK_CONFIGS[key] || NETWORK_CONFIGS.localhost;
}

function mapNetworkToEnvironment(name?: string): Environment {
  switch (name) {
    case "celo":
    case "celo-mainnet":
    case "mainnet":
      return "mainnet";
    case "alfajores":
    case "celo-alfajores":
    case "testnet":
      return "testnet";
    default:
      return "localhost";
  }
}

// Match the on-chain event exactly (includes title)
const CourseCreatedEvent = parseAbiItem(
  'event CourseCreated(uint256 indexed courseId, string title, address indexed instructor, uint256 price, string metadataUri)'
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
    const logs = await client.getLogs({
      address: addresses.proxyAddress as `0x${string}`,
      event: CourseCreatedEvent,
      args: { courseId: BigInt(courseId) },
      fromBlock: BigInt(0),
      toBlock: 'latest',
      strict: true,
    });

    if (!logs.length) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Take the latest occurrence (in case of re-emits in upgrades)
    const last = logs[logs.length - 1];
    const { title: eventTitle, instructor, price, metadataUri } = last.args as {
      courseId: bigint; title: string; instructor: `0x${string}`; price: bigint; metadataUri: string;
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
      price: price.toString(), // stringified for JSON safety
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