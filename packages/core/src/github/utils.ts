import * as parser from "@babel/parser";
import * as t from "@babel/types";
import { z } from "zod";

let traverse: any;

export * as GitHubUtils from "./utils";
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

    return imports;
  });
