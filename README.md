# PinoyScript

A fun interpreted programming language built with **Deno** and TypeScript that uses Filipino words as keywords
## Installation

  ### Prerequisites
  PinoyScript requires **Deno** to run. Install it first:
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
```
Make sure to clone this repository, and run:
```bash
deno install --global --allow-all --name pinoy main.ts
```
## Usage

Once installed, you can run scripts using this command:
```bash
pinoy filename.pinoy
```
> The file extension for a PinoyScript file is `.pinoy`

## Syntax
### Variables
A variable can be declared as `si` (mutable) and `tlga` (const). To assign values to variables, you can use `ay` or `=`.
```ts
si x ay "foo";
si y ay 1;
si z = 20;
tlga a ay 20;
```
### Special Values 
#### Booleans
- `tama` is `true`
- `mali` is `false`
#### Null
- `wala` is `null`
### Basic Operators
#### Arithmetic Operators
- `+` to add
- `-` to subtract
- `*` to multiply
- `/` to divide (floating point division)
- `**` to exponetiate
- `%` to perform modular arithmetic
## Built-in Functions

Here is an example script in PinoyScript:
```typescript
si x ay numero(pasok("Binigyan ng age: "));
kung (x >= 18) {
  sabi("adult");
} edi {
  sabi("bata");
}
```

So in style, it is pretty much a C-Style language (has semicolons, curly braces).
### Printing
There are two built-in functions for printing:
1. `sabi()`
2. `sabiln()`

`sabi()` prints out text, but doesnt automatically add a newline. However, you can manually add newlines like this:
```ts
sabi("foo\n");
```
`sabiln()` prints out text that automatically adds a newline.

Both function support string concatenation, and PinoyScript as a whole supports string concatenation.

### Input
`pasok()` is a function used to get input, you can use it to put input into a variable, inputted values are strings by default.
```ts
si x ay pasok("Tanong: ");
```
### Type casting
`numero()` and `teksto()` are both used to type cast variables, and input.
```ts
si x ay numero(pasok("Tanong: "))
si x ay teksto(pasok("Tanong: ")) // This is redundant since pasok() already returns a string by default
```

### Finding maximum
`pinakamalaki()` outputs the maximum of the given arguments
```ts
pinakamalaki(1,3,2) // Outputs 3
```

More Features to come! PinoyScript doesn't support lists or the like yet :(, this will depend on my motivation :D.