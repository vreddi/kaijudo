import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, readProjectConfiguration } from "@nx/devkit";

import { packageGenerator } from "./package";
import { PackageGeneratorSchema } from "./schema";

describe("package generator", () => {
  let tree: Tree;
  const options: PackageGeneratorSchema = { name: "test" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await packageGenerator(tree, options);
    const config = readProjectConfiguration(tree, "@kaijudo/test");
    expect(config).toBeDefined();
    expect(config.root).toBe("packages/test");
    expect(config.sourceRoot).toBe("packages/test/src");
  });
});
