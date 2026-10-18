import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, identifier } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts"

export default class Parser {
  private tokens: Token[] = [];
  
  // Checks if the program is at end of file (EOF)
  private not_eof (): boolean {
    return this.tokens[0].type !=  TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as TokenType.EOF;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  public produceAST (sourceCode: string) {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse till end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt())
    }
    return program;
  }

  private parse_stmt (): Stmt {
    // skip to parse_expr
    return this.parse_expr();
  }

  private parse_expr (): Expr {
    return this.parse_primary_expr();
  }

  private parse_primary_expr (): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumbericLiteral", 
          value: parseFloat(this.eat().value) 
        } as NumericLiteral;

      default:
        console.log("Unexpected token found during parsing", this.at());
        Deno.exit(1);
    }

  }
}