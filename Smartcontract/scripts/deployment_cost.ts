import { ethers } from "hardhat";
import { formatEther, parseUnits } from "ethers";

async function main() {
    console.log("🔍 Calculating deployment cost for Celorean contract on Celo Mainnet...\n");

    // Get the contract factory
    const CeloreanFactory = await ethers.getContractFactory("Celorean");

    // Contract constructor parameters
    const name = "Celorean NFT";
    const symbol = "CEL";

    try {
        // Estimate deployment gas
        console.log("📊 Estimating gas for deployment...");

        // Get the bytecode for deployment
        const contractBytecode = CeloreanFactory.bytecode;
        const deploymentData = CeloreanFactory.getDeployTransaction(name, symbol);

        // Create a temporary provider for Celo mainnet
        const celoProvider = new ethers.JsonRpcProvider("https://forno.celo.org");

        // Get current gas prices from Celo mainnet
        console.log("🌐 Fetching current Celo mainnet gas prices...");
        const feeData = await celoProvider.getFeeData();

        // Estimate gas limit for deployment
        const estimatedGas = await celoProvider.estimateGas({
            data: contractBytecode
        });

        console.log("\n📈 Gas Estimation Results:");
        console.log("================================");
        console.log(`Estimated Gas Limit: ${estimatedGas.toLocaleString()} units`);

        // Current gas prices on Celo
        const gasPrice = feeData.gasPrice || parseUnits("0.5", "gwei"); // Fallback to 0.5 gwei
        const maxFeePerGas = feeData.maxFeePerGas || parseUnits("2", "gwei"); // Fallback for EIP-1559
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || parseUnits("0.1", "gwei");

        console.log(`Current Gas Price: ${formatEther(gasPrice * BigInt(1e9))} CELO per gas unit`);
        console.log(`Max Fee Per Gas: ${formatEther((maxFeePerGas || gasPrice) * BigInt(1e9))} CELO per gas unit`);

        // Calculate costs
        const legacyCost = estimatedGas * gasPrice;
        const eip1559Cost = estimatedGas * (maxFeePerGas || gasPrice);

        console.log("\n💰 Deployment Cost Estimates:");
        console.log("================================");
        console.log(`Legacy Transaction: ${formatEther(legacyCost)} CELO`);
        console.log(`EIP-1559 Transaction: ${formatEther(eip1559Cost)} CELO`);

        // Get current CELO/USD price (approximate)
        await getCeloPriceAndConvert(BigInt(legacyCost), BigInt(eip1559Cost));

        // Additional cost breakdown
        console.log("\n📋 Detailed Breakdown:");
        console.log("================================");
        const bytecodeSize = contractBytecode.length / 2 - 1; // Remove '0x' prefix and convert to bytes
        console.log(`Contract Bytecode Size: ~${bytecodeSize.toLocaleString()} bytes`);
        console.log(`Gas per byte: ~${Math.round(Number(estimatedGas) / bytecodeSize)} gas/byte`);
        console.log(`Total estimated gas: ${estimatedGas.toLocaleString()} units`);

        // Safety recommendations
        console.log("\n⚠️  Deployment Recommendations:");
        console.log("================================");
        console.log(`• Recommended Gas Limit: ${(estimatedGas * BigInt(120) / BigInt(100)).toLocaleString()} units (20% buffer)`);
        console.log(`• Estimated Max Cost: ${formatEther(estimatedGas * BigInt(120) / BigInt(100) * (maxFeePerGas || gasPrice))} CELO`);
        console.log("• Deploy during low network activity for better gas prices");
        console.log("• Consider using a gas price oracle for optimal pricing");

        // Network info
        console.log("\n🌐 Celo Network Information:");
        console.log("================================");
        const latestBlock = await celoProvider.getBlockNumber();
        console.log(`Latest Block: ${latestBlock}`);
        console.log("Network: Celo Mainnet");
        console.log("Chain ID: 42220");
        console.log("Native Token: CELO");
        console.log("RPC URL: https://forno.celo.org");

    } catch (error) {
        console.error("❌ Error calculating deployment cost:", error);

        // Fallback estimation if network call fails
        console.log("\n🔄 Using fallback estimates...");
        const fallbackGasLimit = BigInt(3000000); // Typical for complex contracts
        const fallbackGasPrice = parseUnits("1", "gwei");
        const fallbackCost = fallbackGasLimit * fallbackGasPrice;

        console.log(`Estimated Gas Limit: ${fallbackGasLimit.toLocaleString()} units`);
        console.log(`Estimated Gas Price: 1 gwei`);
        console.log(`Estimated Cost: ${formatEther(fallbackCost)} CELO`);
    }
}

async function getCeloPriceAndConvert(legacyCost: bigint, eip1559Cost: bigint) {
    try {
        console.log("\n💵 USD Cost Estimates (approximate):");
        console.log("================================");

        // Note: In a real implementation, you'd fetch from an API like CoinGecky
        // For demo purposes, using approximate CELO price
        const approxCeloPrice = 0.50; // USD per CELO (this should be fetched from an API)

        const legacyCostUSD = Number(formatEther(legacyCost)) * approxCeloPrice;
        const eip1559CostUSD = Number(formatEther(eip1559Cost)) * approxCeloPrice;

        console.log(`Legacy Transaction: ~$${legacyCostUSD.toFixed(4)} USD`);
        console.log(`EIP-1559 Transaction: ~$${eip1559CostUSD.toFixed(4)} USD`);
        console.log("(Note: CELO price is approximate - check current rates)");

    } catch (error) {
        console.log("Could not fetch CELO price for USD conversion");
    }
}

// Additional utility function to compare with other networks
async function compareNetworkCosts() {
    console.log("\n🔄 Network Cost Comparison:");
    console.log("================================");
    console.log("Celo Mainnet: ~$0.001 - $0.01 per transaction");
    console.log("Ethereum Mainnet: ~$5 - $50+ per transaction");
    console.log("Polygon: ~$0.01 - $0.10 per transaction");
    console.log("BSC: ~$0.10 - $1.00 per transaction");
    console.log("\n✅ Celo offers significantly lower deployment costs!");
}

// Execute the main function
main()
    .then(() => {
        compareNetworkCosts();
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Script failed:", error);
        process.exit(1);
    });