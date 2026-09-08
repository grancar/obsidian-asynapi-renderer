// Usage: node scripts/bump-manifest.mjs <version>
// Sets manifest.json version and records version -> minAppVersion in versions.json.
import fs from 'fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error(`bump-manifest: expected x.y.z, got "${version}"`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.version = version;
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');

const versions = JSON.parse(fs.readFileSync('versions.json', 'utf8'));
versions[version] = manifest.minAppVersion;
fs.writeFileSync('versions.json', JSON.stringify(versions, null, 2) + '\n');
