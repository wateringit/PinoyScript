import Parser from "./frontend/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";
import Environment from "./runtime/environment.ts"
import { MK_NUMBER, MK_NULL, MK_BOOL } from "./runtime/values.ts"
repl();

function repl () {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("x", MK_NUMBER(100));
  env.declareVar("true", MK_BOOL(true));
  env.declareVar("false", MK_BOOL(false));
  env.declareVar("null", MK_NULL());
  console.log("\n REPL v1")
  while (true) {
    const input = prompt(">");

    // Quits repl if exit keyword is typed or no input
    if (!input || input.includes("exit")) {
      Deno.exit(1)
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    console.log(result);
  }
}