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
- `//` to perform integer division
- `**` to exponetiate
- `%` to perform modular arithmetic
#### Comparison Operators
- `==` for equality comparison
- `>=` for greater than or equal to
- `<=` for less than or equal to
- `>` for greater than
- `<` for less than
- `!=` for not equal to
#### Augmented Operators
- `+=`, `-=`, `*=`, `/=`, and `%=` are supported
> Note: Even if `ay` can be used to assign values to variables, it is invalid to say `+ay` and the like for augmented operators
### Conditionals
- `kung` for if
- `edi kung` for else if
- `edi` for else

Example:
```ts
kung (condition) {
  // foo
} edi kung (condition) {
  // bar
} edi {
  // baz
}
```
### Loops and Iteration
- `habang` for `while` loops
- `para` for `for` loops

Example:
```ts
habang (condition) {
  // foo
}
para (si i = 0; i < 20; i += 1) {
  // bar
}
```
- `tuloy` to skip the iteration
- `hinto` to break the loop

Example: 
```ts 
para (si i = 0; i < 20; i += 1) {
  kung (i == 5) {
    hinto;
  } edi {
    tuloy;
  }
}
```
### Functions
`paraan` is used to declare functions like this:
```ts
paraan test_func(args) {
  // foo
}
```
`balik` is used to return a value
```ts
paraan test_func(args) {
  balik args;
}
```
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

## WIP features
Post and pre-incrementor, and more built-in functions if I feel like it