# ts-build

Build several typescript projects in a monorepo together using Typescript's build mode and [project references](https://www.typescriptlang.org/docs/handbook/project-references.html).

```
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

Build constants can be defined using the `-d` or `--define` options. The
argument for the option should be `key=value` format. For this to work, the
typescript config for each package must have a `baseUrl` set and also an entry
in `paths` which aliases the package `@ts-build/build-constants` to a local
file.

For packages with this config, ts-build will output a similarly-named file, with
the extension `.build.ts` which can be added to .gitignore. The generated
`tsconfig.build.ts` will have the package alias switched to this new file.
```

The tool will collect all packages reachable in the first or second level of each folder specified and generate `tsconfig.json` files with appropriate `references` sections.

## Examples

Given the following structure:

```
    packages/
        componentA/
            package.json
            tsconfig.json
        componentB/
            package.json
            tsconfig.json
        componentC/
            package.json
            tsconfig.json

    apps/
        api/
            package.json
            tsconfig.json
        tool/
            package.json
```

A useful command line could be:

```bash
$ ts-build package/ apps/api -w
```

This will create `tsconfig.build.ts` files in `componentA`, `componentB`, `componentC` and `apps/api` using project references discovered from the respective `package.json` files, and also in the root with references to all reached packages. It will then run `tsc -b tsconfig.build.json` and passing any options supplied.
