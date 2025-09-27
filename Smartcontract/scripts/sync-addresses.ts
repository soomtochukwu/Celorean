/*
  Sync Smartcontract addresses to frontend consumable JSONs
  - Reads Smartcontract/addresses/addresses.json
  - Writes frontend/contracts/addresses/*.json
*/
import fs from 'fs';
import path from 'path';

interface EnvAddresses {
  proxyAddress: string | null;
  implementationAddress: string | null;
  network: string;
  environment: 'localhost' | 'testnet' | 'mainnet' | string;
  deployedAt?: string | null;
  deployer?: string | null;
  certificateNFT?: string | null;
  eventManager?: string | null;
  verifierRegistry?: string | null;
  [k: string]: unknown;
}

interface AddressesFile {
  environments: Record<string, EnvAddresses>;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function main() {
  const smartcontractRoot = path.resolve(__dirname, '..');
  const addressesJsonPath = path.resolve(smartcontractRoot, 'addresses', 'addresses.json');
  const frontendRoot = path.resolve(smartcontractRoot, '..', 'frontend');
  const frontendAddressesDir = path.resolve(frontendRoot, 'contracts', 'addresses');
  const frontendContractsDir = path.resolve(frontendRoot, 'contracts');

  if (!fs.existsSync(addressesJsonPath)) {
    console.error(`[sync-addresses] Missing addresses file: ${addressesJsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(addressesJsonPath, 'utf8');
  let parsed: AddressesFile;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('[sync-addresses] Failed to parse addresses.json:', e);
    process.exit(1);
  }

  if (!parsed.environments) {
    console.error('[sync-addresses] Invalid schema: missing environments');
    process.exit(1);
  }

  ensureDir(frontendAddressesDir);
  ensureDir(frontendContractsDir);

  const envMap: Record<string, string> = {
    localhost: 'localhost-addresses.json',
    testnet: 'alfajores-addresses.json',
    mainnet: 'mainnet-addresses.json',
  };

  let wrote = 0;
  for (const [envKey, env] of Object.entries(parsed.environments)) {
    const filename = envMap[envKey] || `${envKey}-addresses.json`;
    const outPath = path.resolve(frontendAddressesDir, filename);

    const out: any = {
      proxyAddress: env.proxyAddress ?? null,
      implementationAddress: env.implementationAddress ?? null,
      network: env.network ?? envKey,
      environment: (env.environment as string) || envKey,
      deployedAt: env.deployedAt ?? null,
      deployer: env.deployer ?? null,
    };

    // Include extended addresses if available
    if (env.certificateNFT) out.certificateNFT = env.certificateNFT;
    if (env.eventManager) out.eventManager = env.eventManager;
    if (env.verifierRegistry) out.verifierRegistry = env.verifierRegistry;

    writeJson(outPath, out);
    wrote++;
    console.log(`[sync-addresses] Wrote ${filename}`);
  }

  // Copy ABIs to frontend/contracts (best-effort)
  try {
    const artifactsDir = path.join(smartcontractRoot, 'artifacts', 'contracts');
    const abiMap: Array<{ src: string; dest: string }> = [
      { src: path.join(artifactsDir, 'Celorean.sol/Celorean.json'), dest: path.join(frontendContractsDir, 'Celorean.json') },
      { src: path.join(artifactsDir, 'CertificateNFT.sol/CertificateNFT.json'), dest: path.join(frontendContractsDir, 'CertificateNFT.json') },
      { src: path.join(artifactsDir, 'EventManager.sol/EventManager.json'), dest: path.join(frontendContractsDir, 'EventManager.json') },
      { src: path.join(artifactsDir, 'VerifierRegistry.sol/VerifierRegistry.json'), dest: path.join(frontendContractsDir, 'VerifierRegistry.json') },
    ];

    for (const { src, dest } of abiMap) {
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, dest);
          console.log(`📦 Copied ABI to frontend: ${path.basename(dest)}`);
        } catch (e) {
          console.log(`⚠️  Failed to copy ABI ${src}:`, (e as Error).message || e);
        }
      }
    }
  } catch (e) {
    console.log('[sync-addresses] ⚠️  ABI copy step failed:', (e as Error).message || e);
  }

  console.log(`[sync-addresses] Completed. Updated ${wrote} file(s) under frontend/contracts/addresses.`);
}

main();