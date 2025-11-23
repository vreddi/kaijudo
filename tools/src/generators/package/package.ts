import {
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
  installPackagesTask,
} from "@nx/devkit";
import * as path from "path";
import { PackageGeneratorSchema } from "./schema";

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export async function packageGenerator(
  tree: Tree,
  options: PackageGeneratorSchema
) {
  const packageName = options.name;
  const componentName = toPascalCase(packageName);
  const projectRoot = `packages/${packageName}`;
  const packageFullName = `@kaijudo/${packageName}`;

  // Generate files from templates
  generateFiles(tree, path.join(__dirname, "files"), projectRoot, {
    ...options,
    packageName,
    componentName,
    packageFullName,
  });

  // Update tsconfig.base.json to include the new package
  updateJson(tree, "tsconfig.base.json", (json) => {
    if (!json.compilerOptions) {
      json.compilerOptions = {};
    }
    if (!json.compilerOptions.paths) {
      json.compilerOptions.paths = {};
    }
    json.compilerOptions.paths[packageFullName] = [
      `${projectRoot}/src/index.ts`,
    ];
    return json;
  });

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
  };
}

export default packageGenerator;
