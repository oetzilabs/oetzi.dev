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
        code: string[];
        import: string;
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
      z.array(z.string()),
    ])
  )
  .implement(async (fileContent, exclude) => {
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
        code: string[];
        import: string;
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
                if (!exclude.includes(importedIdentifier.name))
                  imports[importedIdentifier.name] = {
                    line: node.loc.start.line,
                    file: fileContent.path,
                    import: fileContent.content.split("\n")[node.loc.start.line - 1].trim(),
                    code: [],
                  };
            }
          });
        }
      },
      Identifier(path: any) {
        const identifierName = path.node.name;
        if (imports[identifierName]) {
          const statement = path.findParent((path: any) => path.isStatement());
          if (statement) {
            const startLine = statement.node.loc.start.line;
            const endLine = statement.node.loc.end.line;
            const codeBlock = fileContent.content
              .split("\n")
              .slice(startLine - 1, endLine)
              .join("\n");
            if (imports[identifierName].import !== codeBlock.trim()) imports[identifierName].code.push(codeBlock);
          }
        }
      },
    });

    traverseCache[fileContent.path] = { imports, code: fileContent.content };

    return imports;
  });
