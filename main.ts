import Parser from "./frontend/parser.ts";
import { evaluate } from './runtime/interpreter.ts';

repl();

function repl () {
  const parser = new Parser();
  console.log("\n REPL v1")
  while (true) {
    const input = prompt(">");

    // Quits repl if exit keyword is typed or no input
    if (!input || input.includes("exit")) {
      Deno.exit(1)
    }

    const program = parser.produceAST(input);
    console.log(program);

    const result = evaluate(program);
    console.log(result);

    console.log("------\n\n")
  }
}