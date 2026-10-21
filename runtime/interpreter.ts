import { AssignmentExpr, AugmentedAssignmentExpr, BinaryExpr, CallExpr, ForStmt, FunctionDeclaration, Identifier, IfStmt, NumericLiteral, ObjectLiteral, Program, ReturnStmt, Stmt, StringLiteral, VarDeclaration, WhileStmt } from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { evaluate_assignments, evaluate_binary_expr, evaluate_call_expr, evaluate_identifier, evaluate_object_expr, evaluate_string_expr } from "./eval/expressions.ts";
import { evaluate_for_stmt, evaluate_function_declaration, evaluate_if_statement, evaluate_program, evaluate_return_stmt, evaluate_var_declaration, evaluate_while_stmt } from "./eval/statements.ts";
import { BreakSignal, ContinueSignal, NumberVal, RuntimeVal } from "./values.ts";


export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value), 
        type: "number", 
      } as NumberVal;
    case "StringLiteral":
      return evaluate_string_expr(astNode as StringLiteral, env);
    case "Identifier":
      return evaluate_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return evaluate_object_expr(astNode as ObjectLiteral, env);
    case "CallExpr":
      return evaluate_call_expr(astNode as CallExpr, env);
    case "AssignmentExpr":
      return evaluate_assignments(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return evaluate_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return evaluate_program(astNode as Program, env);
    // Handle Statements
    case "VarDeclaration":
      return evaluate_var_declaration(astNode as VarDeclaration, env);
    case "AugmentedAssignmentExpr":
      return evaluate_assignments(astNode as AugmentedAssignmentExpr, env);
    case "FunctionDeclaration":
      return evaluate_function_declaration(astNode as FunctionDeclaration, env );
    case "ReturnStmt":
      return evaluate_return_stmt(astNode as ReturnStmt, env);
    case "WhileStmt":
      return evaluate_while_stmt(astNode as WhileStmt, env);
    case "ForStmt":
      return evaluate_for_stmt(astNode as ForStmt, env);
    case "IfStmt":
      return evaluate_if_statement(astNode as IfStmt, env);
    case "BreakStmt":
      throw new BreakSignal();
    case "ContinueStmt":
      throw new ContinueSignal();
    default:
      console.error("Unrecognized AST Node" , astNode);
      Deno.exit(0);
  }
}

