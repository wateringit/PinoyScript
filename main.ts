import Parser from "./frontend/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";
run("./test.txt");
// repl();
async function run(filename: string) {
  const parser = new Parser();
  const env = new Environment();
  const input = await Deno.readTextFile(filename);
  const program = parser.produceAST(input);
  const result = evaluate(program, env);
  console.log(result);

}
function repl () {
  const parser = new Parser();
  const env = new Environment();
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