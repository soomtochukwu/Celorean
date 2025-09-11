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
  [k: string]: unknown;
}

interface AddressesFile {
  _metadata?: Record<string, unknown>;
  environments: Record<string, EnvAddresses>;
  networks?: Record<string, unknown>;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function main() {
  const smartcontractRoot = path.resolve(__dirname, '..', '..');
  const addressesJsonPath = path.resolve(smartcontractRoot, 'addresses', 'addresses.json');
  const frontendAddressesDir = path.resolve(smartcontractRoot, '..', 'frontend', 'contracts', 'addresses');

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

  const envMap: Record<string, string> = {
    localhost: 'localhost-addresses.json',
    testnet: 'alfajores-addresses.json',
    mainnet: 'mainnet-addresses.json',
  };

  let wrote = 0;
  for (const [envKey, env] of Object.entries(parsed.environments)) {
    const filename = envMap[envKey] || `${envKey}-addresses.json`;
    const outPath = path.resolve(frontendAddressesDir, filename);

    const out = {
      proxyAddress: env.proxyAddress ?? null,
      implementationAddress: env.implementationAddress ?? null,
      network: env.network ?? envKey,
      environment: (env.environment as string) || envKey,
      deployedAt: env.deployedAt ?? null,
      deployer: env.deployer ?? null,
    };

    writeJson(outPath, out);
    wrote++;
    console.log(`[sync-addresses] Wrote ${filename}`);
  }

  console.log(`[sync-addresses] Completed. Updated ${wrote} file(s) under frontend/contracts/addresses.`);
}

main();