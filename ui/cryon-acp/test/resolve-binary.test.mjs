import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import test from "node:test";
import { isAbsolute, join, relative, resolve } from "node:path";

import * as publicApi from "../dist/index.js";
import { resolveCryonBinaryForRuntime } from "../dist/resolve-binary.js";

const supportedPlatforms = [
  ["darwin", "arm64", "@aaif/cryon-binary-darwin-arm64", "cryon"],
  ["darwin", "x64", "@aaif/cryon-binary-darwin-x64", "cryon"],
  ["linux", "arm64", "@aaif/cryon-binary-linux-arm64", "cryon"],
  ["linux", "x64", "@aaif/cryon-binary-linux-x64", "cryon"],
  ["win32", "x64", "@aaif/cryon-binary-win32-x64", "cryon.exe"],
];

function setCryonBinary(t, value) {
  const original = process.env.CRYON_BINARY;
  process.env.CRYON_BINARY = value;
  t.after(() => {
    if (original === undefined) {
      delete process.env.CRYON_BINARY;
    } else {
      process.env.CRYON_BINARY = original;
    }
  });
}

for (const [
  platform,
  arch,
  packageName,
  executableName,
] of supportedPlatforms) {
  test(`resolves ${platform}-${arch}`, () => {
    let resolvedSpecifier;
    let checkedPath;
    const fixturePackageRoot = join("/fixtures", packageName);

    const result = resolveCryonBinaryForRuntime(platform, arch, {
      resolvePackageJson(specifier) {
        resolvedSpecifier = specifier;
        return join(fixturePackageRoot, "package.json");
      },
      isFile(path) {
        checkedPath = path;
        return true;
      },
    });

    assert.equal(resolvedSpecifier, `${packageName}/package.json`);
    assert.equal(result, resolve(fixturePackageRoot, "bin", executableName));
    assert.equal(checkedPath, result);
    assert.equal(isAbsolute(result), true);
  });
}

test("exports only the public resolver from the package root", () => {
  assert.deepEqual(Object.keys(publicApi), ["resolveCryonBinary"]);
});

test("uses CRYON_BINARY as an explicit override", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "cryon-acp-override-"));
  const binaryPath = join(directory, "cryon");
  writeFileSync(binaryPath, "");
  setCryonBinary(t, relative(process.cwd(), binaryPath));

  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  assert.equal(publicApi.resolveCryonBinary(), binaryPath);
});

test("rejects an invalid CRYON_BINARY override", (t) => {
  setCryonBinary(t, "missing-cryon-binary");

  assert.throws(
    () => publicApi.resolveCryonBinary(),
    /CRYON_BINARY does not point to a file/,
  );
});

test("reports unsupported platform and architecture combinations", () => {
  assert.throws(
    () =>
      resolveCryonBinaryForRuntime("freebsd", "x64", {
        resolvePackageJson() {
          throw new Error("should not resolve a package");
        },
        isFile() {
          return false;
        },
      }),
    /No Cryon npm binary is available for freebsd-x64/,
  );
});

test("reports a missing optional platform package", () => {
  assert.throws(
    () =>
      resolveCryonBinaryForRuntime("linux", "x64", {
        resolvePackageJson() {
          throw new Error("module not found");
        },
        isFile() {
          return false;
        },
      }),
    /Cryon binary package @aaif\/cryon-binary-linux-x64 is not installed/,
  );
});

test("reports a missing executable in an installed platform package", () => {
  assert.throws(
    () =>
      resolveCryonBinaryForRuntime("darwin", "arm64", {
        resolvePackageJson() {
          return join(
            "/fixtures",
            "@aaif/cryon-binary-darwin-arm64/package.json",
          );
        },
        isFile() {
          return false;
        },
      }),
    /Cryon executable from @aaif\/cryon-binary-darwin-arm64 was not found/,
  );
});
