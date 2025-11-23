import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, defineChain } from "viem";
import { localhost, celo } from "viem/chains";
import CeloreanABI from "@/contracts/Celorean.json";
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

// Network configuration mapping
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
  // Accept high-level env names ('testnet'/'mainnet') and map to concrete keys
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

function isAddressLike(val: any): val is `0x${string}` {
  return typeof val === "string" && /^0x[a-fA-F0-9]{40}$/.test(val);
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, network: requestNetwork, viewer } = await request.json();

    // Determine environment and addresses based on network
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

    const account = isAddressLike(viewer) ? (viewer as `0x${string}`) : undefined;

    const courseData = await client.readContract({
      address: addresses.proxyAddress as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourse",
      args: [courseId],
      account,
    } as any);

    // Serialize BigInt values before returning JSON
    const serializedCourseData = serializeBigInt(courseData);

    return NextResponse.json(serializedCourseData);
  } catch (error: any) {
    const reason = error?.reason || error?.shortMessage || error?.message || "Failed to fetch course";
    // Avoid noisy error logs for expected authorization failures
    if (typeof reason === 'string' && reason.includes('Access denied')) {
      return NextResponse.json(
        { error: 'Access denied: not authorized' },
        { status: 403 }
      );
    }
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: reason },
      { status: 500 }
    );
  }
}

// Helper to serialize BigInt values
function serializeBigInt(value: any): any {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(serializeBigInt);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) {
      out[k] = serializeBigInt((value as any)[k]);
    }
    return out;
  }
  return value;
}
