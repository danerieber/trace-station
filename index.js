import chalk from "chalk";

const root = {
  name: null,
  args: [],
  msg: null,
  children: [],
};

function parseStack(e) {
  return e.stack ? e.stack.split("at ").map((l) => l.split(" ")[0]) : [];
}

function printTracesTree() {
  console.clear();
  const q = [[root, 0]];
  while (q.length) {
    let [{ name, args, msg, children }, d] = q.pop();

    const depth = chalk.dim("-").repeat(d);
    name = chalk.green(name);
    args = args ? [...args].map((a) => chalk.yellow(a)).join(", ") : "";
    msg = msg ? chalk.magenta(msg) : "";
    console.log(`${depth}${name}(${args}) ${msg}`);

    q.push(...children.map((c) => [c, d + 1]));
  }
}

function search(name) {
  const q = [root];
  while (q.length) {
    const f = q.pop();
    if (f.name === name) {
      return f;
    }
    q.push(...f.children);
  }
}

export function trace({ arguments: args, message: msg }) {
  const stack = parseStack(new Error()).slice(2);
  const name = stack[0];

  if (!root.name) {
    root.name = name;
    root.args = args;
    root.msg = msg;
  }

  const f = search(name);
  if (f) {
    f.name = name;
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
