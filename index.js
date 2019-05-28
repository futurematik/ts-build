#!/usr/bin/env node

const splitArgs = require('./splitArgs');
const main = require('./main');

const usage = `
USAGE
  ts-build [ts-build-options] <folders...> [tsc-options...]

ARGUMENTS
  ts-build-options
    -d, --define name=value   Define a constant that will be inserted into the
                              build when ts-build is run.

  folders
    A list of folders containing typescript packages. Each folder must either
    contain a package.json, or contain folders which contain package.json files.

  tsc-options
    Options to pass to tsc.


BUILD CONSTANTS

Build constants can be defined using the \`-d\` or \`--define\` options. The
argument for the option should be \`key=value\` format. For this to work, the
typescript config for each package must have a \`baseUrl\` set and also an entry
in \`paths\` which aliases the package \`@ts-build/build-constants\` to a local
file.

For packages with this config, ts-build will output a similarly-named file, with
the extension \`.build.ts\` which can be added to .gitignore. The generated
\`tsconfig.build.ts\` will have the package alias switched to this new file.
`;

const args = splitArgs(process.argv.slice(2));

if (!args) {
  console.log(usage);
  process.exit(2);
}

main(args.tsBuildFlags, args.packages, args.tscArgs).catch(e => {
  console.error(e.toString());
  process.exit(1);
});
