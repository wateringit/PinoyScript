import { BinaryExpr, Identifier, NumericLiteral, Program, Stmt, VarDeclaration } from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { evaluate_binary_expr, evaluate_identifier } from "./eval/expressions.ts";
import { evaluate_program, evaluate_var_declaration } from "./eval/statements.ts";
import { NumberVal, RuntimeVal } from "./values.ts";


export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value), 
        type: "number", 
      } as NumberVal;
    case "Identifier":
      return evaluate_identifier(astNode as Identifier, env);
    case "BinaryExpr":
      return evaluate_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return evaluate_program(astNode as Program, env);
    // Handle Statements
    case "VarDeclaration":
      return evaluate_var_declaration(astNode as VarDeclaration, env);
    default:
      console.error("Unrecognized AST Node" , astNode);
      Deno.exit(0);
  }
}