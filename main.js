const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const processFlags = require('./processFlags');
const getPackages = require('./getPackages');
const findTsc = require('./findTsc');

const buildTsConfigFileName = 'tsconfig.build.json';
const constantsFilePath = 'constants.build.json';

/**
 * Run the program.
 * @param {object} tsBuildFlags flags for this program
 * @param {string[]} folders package paths
 * @param {string[]} tscArgs args for typescript compiler
 */
module.exports = async function main(tsBuildFlags, folders, tscArgs) {
  const options = processFlags(tsBuildFlags);
  const hasDefines = Object.keys(options.define).length > 0;
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
    let constantsCfg = {};

    if (hasDefines) {
      writeFile(path.join(pkg.basePath, constantsFilePath), options.define);
    }

    pkg.buildTsConfig = {
      ...pkg.tsConfig,
      compilerOptions: {
        ...pkg.tsConfig.compilerOptions,
        declaration: true,
        composite: true,
        ...constantsCfg,
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
    ...tscArgs,
  ]);
  process.exit(exitCode);
};

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
