export enum TokenType {
  // Literal Types 
  Number,
  Identifier,
  // Grouping + Operators
  Equals,
  OpenParen,
  CloseParen,
  BinaryOperator,
  EOF, // End of File

  // Keywords
  Let,
}

const KEYWORDS: Record<string, TokenType> = {
  "si" : TokenType.Let,
}

export interface Token {
  value : string,
  type : TokenType,
}

function token(value = "", type: TokenType) : Token {
  return { value, type };
}

function isalpha (src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

function isskippable (str: string) {
  return str == ' ' || str == '\n' || str == '\t';
}

function isint (str: string) {
  const c = str.charCodeAt(0);
  const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
  return (c >= bounds[0] && c <= bounds[1]);
}
export function tokenize (sourceCode: string) : Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");
  // Build tokens
  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else {
      // Handle multichar tokens
      if (isint(src[0])) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      } else if (isalpha(src[0])) {
        let identifier = "";
        while (src.length > 0 && isalpha(src[0])) {
          identifier += src.shift();
        }

        // check for reservered keywords
        const reserved = KEYWORDS[identifier];
        if (reserved == undefined) {
          tokens.push(token(identifier, TokenType.Identifier));
        } else {
          tokens.push(token(identifier, reserved));
        }
      } else if (isskippable(src[0])) {
        src.shift(); // Skips char
      } else {
        console.log("Unrecognized character found in source: ", src[0]);
        Deno.exit(1);
      }
    }
  }
  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
