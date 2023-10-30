import { z } from "zod";

export * as GitHubUtils from "./utils";

let traverse: any;

let traverseCache: Record<
  string,
  {
    imports: Record<
      string,
      {
        line: number;
        file: string;
        code: string;
      }
    >;
    code: string;
  }
> = {};

export const extractImports = z
  .function(
    z.tuple([
      z.object({
        content: z.string(),
        path: z.string(),
      }),
    ])
  )
  .implement(async (fileContent) => {
    if (traverseCache[fileContent.path]) {
      return traverseCache[fileContent.path].imports;
    }
    const parser = (await import("@babel/parser")).default;
    const t = (await import("@babel/types")).default;
    const ast = parser.parse(fileContent.content, {
      sourceType: "module",
      plugins: ["typescript"],
    });
    // console.time("extractImports-traverse");
    // @ts-ignore
    if (!traverse) traverse = require("@babel/traverse").default;
    // console.timeEnd("extractImports-traverse");

    const imports: Record<
      string,
      {
        line: number;
        file: string;
        code: string;
      }
    > = {};

    traverse(ast, {
      ImportDeclaration(path: any) {
        const node = path.node;
        if (t.isStringLiteral(node.source) && node.source.value.startsWith("sst/constructs")) {
          node.specifiers.forEach((specifier: any) => {
            if (t.isImportSpecifier(specifier)) {
              const importedIdentifier = specifier.imported;
              if (importedIdentifier.type === "Identifier")
                imports[importedIdentifier.name] = {
                  line: node.loc.start.line,
                  file: fileContent.path,
                  code: fileContent.content.split("\n")[node.loc.start.line - 1].trim(),
                };
            }
          });
        }
      },
    });

    traverseCache[fileContent.path] = { imports, code: fileContent.content };

    return imports;
  });
