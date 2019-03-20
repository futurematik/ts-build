const fs = require('fs');
const path = require('path');

function getPackages(pathOrPaths, child) {
  const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
  const packages = [];

  for (const p of paths) {
    const basePath = path.resolve(p);

    const packageJsonPath = path.join(basePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const tsConfigPath = path.join(basePath, 'tsconfig.json');
      const tsConfig = fs.existsSync(tsConfigPath)
        ? JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))
        : {};

      packages.push({
        basePath,
        tsConfig,
        tsConfigPath,
        packageJson,
        packageJsonPath,
      });
    } else if (!child) {
      packages.push(
        ...getPackages(
          fs
            .readdirSync(p)
            .map(x => path.resolve(basePath, x))
            .filter(x => fs.statSync(x).isDirectory()),
          true,
        ),
      );
    }
  }

  return packages;
}

module.exports = getPackages;
