import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

async function run(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  try {
    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);
    evaluate(program, env);
  } catch (error) {
    console.error(`Error reading file '${filename}':`, error);
    Deno.exit(1);
  }
}

// CLI Entry point
if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.log("Usage: pinoy <filename.pinoy>");
    Deno.exit(1);
  }
  await run(args[0]);
}