#!/usr/bin/env bun
/**
 * Bump the version of a workspace package.
 *
 * Run via the package-level `version:*` scripts so `cwd` is the package root:
 *   bun run --filter @transit-se/sdk version:patch
 *   bun run --filter @transit-se/mcp version:minor
 *
 * Or invoke directly with an explicit cwd:
 *   cd packages/sdk && bun ../../scripts/bump-version.ts patch
 *
 * Examples:
 *   patch        # 0.1.0 → 0.1.1
 *   minor        # 0.1.0 → 0.2.0
 *   major        # 0.1.0 → 1.0.0
 *   prerelease   # 0.1.0 → 0.1.1-beta.0
 */

import { resolve } from 'path';

const PKG_PATH = resolve(process.cwd(), 'package.json');

type BumpType = 'patch' | 'minor' | 'major' | 'prerelease';

function parseArgs(): { bump: BumpType; preid: string } {
  const args = process.argv.slice(2);
  const bump = args.find((a) => !a.startsWith('--')) as BumpType | undefined;
  const preidArg = args.find((a) => a.startsWith('--preid='));
  const preid = preidArg ? preidArg.split('=')[1] : 'beta';

  if (!bump || !['patch', 'minor', 'major', 'prerelease'].includes(bump)) {
    console.error(
      'Usage: bun scripts/bump-version.ts <patch|minor|major|prerelease> [--preid=beta]',
    );
    process.exit(1);
  }

  return { bump, preid };
}

function bumpVersion(current: string, bump: BumpType, preid: string): string {
  // Parse "1.2.3" or "1.2.3-beta.4"
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$/);
  if (!match) {
    console.error(`Invalid version format: ${current}`);
    process.exit(1);
  }

  let [, majorStr, minorStr, patchStr, preTag, preNumStr] = match;
  let major = parseInt(majorStr);
  let minor = parseInt(minorStr);
  let patch = parseInt(patchStr);

  switch (bump) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      return `${major}.${minor}.${patch}`;
    case 'minor':
      minor++;
      patch = 0;
      return `${major}.${minor}.${patch}`;
    case 'patch':
      // If currently a prerelease, just drop the prerelease tag
      if (preTag) {
        return `${major}.${minor}.${patch}`;
      }
      patch++;
      return `${major}.${minor}.${patch}`;
    case 'prerelease':
      if (preTag === preid && preNumStr !== undefined) {
        // Already a prerelease with same preid — increment prerelease number
        return `${major}.${minor}.${patch}-${preid}.${parseInt(preNumStr) + 1}`;
      }
      // New prerelease — bump patch first
      if (!preTag) patch++;
      return `${major}.${minor}.${patch}-${preid}.0`;
  }
}

const { bump, preid } = parseArgs();

const pkg = await Bun.file(PKG_PATH).json();
const oldVersion: string = pkg.version;
const newVersion = bumpVersion(oldVersion, bump, preid);

pkg.version = newVersion;
await Bun.write(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');

console.log(`${pkg.name}: ${oldVersion} → ${newVersion}`);
