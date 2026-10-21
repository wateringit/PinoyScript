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

Here is an example script in PinoyScript:
```typescript
si x ay numero(pasok("Binigyan ng age: "));
kung (x >= 18) {
  sabi("adult");
} edi {
  sabi("bata");
}
```