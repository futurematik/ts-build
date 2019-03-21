#!/usr/bin/env node
const getPackages = require('./getPackages');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const buildTsConfigFileName = 'tsconfig.build.json';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(`
    Usage: 
      ts-build <folders...> -- [tsc options]
  `);
}

run(
  args.filter(x => !x.startsWith('-')),
  args.filter(x => x.startsWith('-')),
).catch(e => {
  console.error(e.toString());
  process.exit(1);
});

async function run(folders, tscFlags) {
  const packageMap = new Map();

  for (const pkg of getPackages(folders)) {
    packageMap.set(pkg.packageJson.name, pkg);
  }

  if (packageMap.size === 0) {
    console.error('nothing to do');
    return process.exit(1);
  }

  const rootTsConfig = {
    files: [],
    references: [],
  };

  for (const pkg of packageMap.values()) {
    pkg.buildTsConfig = {
      ...pkg.tsConfig,
      compilerOptions: {
        ...pkg.tsConfig.compilerOptions,
        declaration: true,
        composite: true,
      },
      references: [],
    };

    if (pkg.packageJson.dependencies) {
      for (const dep of Object.entries(pkg.packageJson.dependencies)) {
        if (packageMap.has(dep[0])) {
          const depPkg = packageMap.get(dep[0]);
          pkg.buildTsConfig.references.push({
            path: path.relative(
              pkg.basePath,
              path.resolve(depPkg.basePath, buildTsConfigFileName),
            ),
          });
        }
      }
    }

    const pkgBuildTsConfigPath = path.join(pkg.basePath, buildTsConfigFileName);
    writeFile(pkgBuildTsConfigPath, pkg.buildTsConfig);

    rootTsConfig.references.push({
      path: path.relative(process.cwd(), pkgBuildTsConfigPath),
    });
  }

  const buildTsConfigPath = path.resolve(buildTsConfigFileName);
  writeFile(buildTsConfigPath, rootTsConfig);

  const exitCode = await runCmd(findTsc(), [
    '-b',
    buildTsConfigPath,
    ...tscFlags,
  ]);
  process.exit(exitCode);
}

function writeFile(path, obj) {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2));
}

function runCmd(command, args) {
  const proc = spawn(command, args, { stdio: 'inherit' });

  return new Promise((resolve, reject) => {
    proc.on('exit', resolve);
    proc.on('error', reject);
  });
}

function findTsc() {
  try {
    let tscPath = require.resolve('typescript', { paths: [process.cwd()] });
    const search = 'node_modules/';

    const i = tscPath.lastIndexOf(search);
    if (i < 0) {
      return 'tsc';
    }

    tscPath = path.join(tscPath.substring(0, i + search.length), '.bin/tsc');
    // this will throw if it doesn't exist
    fs.statSync(tscPath);
    return tscPath;
  } catch (e) {
    // fallback to hoping it's in the path
    return 'tsc';
  }
}
