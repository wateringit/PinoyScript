import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, identifier } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts"
import { NullLiteral } from './ast.ts';

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

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err , prev, "Expecting: ", type);
      Deno.exit(1);
    }
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
    return this.parse_additive_expr();
  }

  private parse_additive_expr (): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }

  private parse_multiplicative_expr (): Expr {
    let left = this.parse_primary_expr();

    while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }

  private parse_primary_expr (): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      
      case TokenType.Null:
        this.eat(); // skip past null keyword
        return { kind: "NullLiteral", value: "null" } as NullLiteral;

      case TokenType.Number:
        return {
          kind: "NumbericLiteral", 
          value: parseFloat(this.eat().value) 
        } as NumericLiteral;
        
      case TokenType.OpenParen: {
        this.eat(); // eat open paren
        const value = this.parse_expr();
        this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesis. Expected closing parenthesis ')'."); // closing parenthesis
        return value;
      }
      default:
        console.log("Unexpected token found during parsing", this.at());
        Deno.exit(1);
    }

  }
}