# ts-build

Build several typescript projects in a monorepo together using Typescript's build mode and [project references](https://www.typescriptlang.org/docs/handbook/project-references.html).

```
USAGE
  ts-build [ts-build-options] <folders...> [tsc-options...]

ARGUMENTS
  ts-build-options
    -d, --define name=value   Define a constant that will be inserted into the
                              build when ts-build is run.

    -e, --env    name1,name2  Copy the given environment variables to the build
                              constants file.

  folders
    A list of folders containing typescript packages. Each folder must either
    contain a package.json, or contain folders which contain package.json files.

  tsc-options
    Options to pass to tsc.


BUILD CONSTANTS

Build constants can be defined using the `-d` or `--define` options. The
argument for the option should be `key=value` format. The program will output
a file called `constants.build.json` in the root of each package, which can
be added to the gitignore.
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
