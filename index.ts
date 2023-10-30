import chalk from "chalk";

interface Node {
  name?: string;
  args?: IArguments;
  msg?: string;
  children: Node[];
}

let root: Node;

function parseStack(e: Error): string[] {
  return e.stack?.split("at ").map((l) => l.split(" ")[0]) ?? [];
}

function printTracesTree() {
  if (!root) return;

  console.clear();
  const q = [{ n: root, d: 0 }];
  while (q.length) {
    const { n, d } = q.pop()!;

    const depth = chalk.dim("-").repeat(d);
    const name = chalk.green(n.name);
    const args = n.args
      ? [...n.args].map((a) => chalk.yellow(a)).join(", ")
      : "";
    const msg = n.msg ? chalk.magenta(n.msg) : "";
    console.log(`${depth}${name}(${args}) ${msg}`);

    q.push(...n.children.map((c) => ({ n: c, d: d + 1 })));
  }
}

function search(name: string): Node | null {
  if (!root) return null;

  const q = [root];
  while (q.length) {
    const f = q.pop()!;
    if (f.name === name) {
      return f;
    }
    q.push(...f.children);
  }

  return null;
}

export function trace({
  arguments: args,
  message: msg,
}: {
  arguments?: IArguments;
  message?: string;
}) {
  const stack = parseStack(new Error()).slice(2);
  const name = stack[0];

  if (!root) {
    root = { name, args, msg, children: [] };
  }

  const f = search(name);
  if (f) {
    f.args = args;
    f.msg = msg;
    f.children = [];
    return printTracesTree();
  }

  for (const s of stack.slice(1)) {
    const f = search(s);
    if (f) {
      f.children.push({ name, args, msg, children: [] });
      return printTracesTree();
    }
  }
}
