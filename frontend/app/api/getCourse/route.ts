import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { localhost, celoAlfajores, celo, lisk, liskSepolia } from "viem/chains";
import CeloreanABI from "@/contracts/Celorean.json";
import contractAddresses from "@/contracts/addresses";

// Network configuration mapping
const NETWORK_CONFIGS = {
  localhost: {
    chain: localhost,
    rpcUrl: "http://127.0.0.1:8545",
  },
  alfajores: {
    chain: celoAlfajores,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
  },
  celo: {
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

function getNetworkConfig(networkName?: string) {
  // Priority: 1. Frontend request, 2. Environment variable, 3. Contract addresses, 4. Default to localhost
  const network =
    networkName ||
    process.env.NEXT_PUBLIC_NETWORK ||
    contractAddresses.network ||
    "localhost";

  const config = NETWORK_CONFIGS[network as NetworkName];
  if (!config) {
    console.warn(`Unknown network: ${network}, falling back to localhost`);
    return NETWORK_CONFIGS.localhost;
  }

  return config;
}

// Helper function to convert BigInt values to strings for JSON serialization
function serializeBigInt(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (obj && typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, network: requestNetwork } = await request.json();

    // Prioritize network from frontend request
    const selectedNetworkConfig = getNetworkConfig(requestNetwork);

    const client = createPublicClient({
      chain: selectedNetworkConfig.chain,
      transport: http(selectedNetworkConfig.rpcUrl),
    });

    const courseData = await client.readContract({
      address: contractAddresses.proxyAddress as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourse",
      args: [courseId],
    });

    // Serialize BigInt values before returning JSON
    const serializedCourseData = serializeBigInt(courseData);

    return NextResponse.json(serializedCourseData);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
