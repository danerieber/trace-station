import { trace } from "./index.js";

async function sample(a: number, b: number) {
  trace({ arguments });
  await inner("hello");
  return a + b;
}

async function inner(value: string) {
  trace({ arguments });
  await doubleInner();
  return value;
}

async function doubleInner() {
  trace({ arguments });
  return (resolve: TimerHandler) => {
    setTimeout(resolve, 1000);
  };
}

(async () => await sample(2, 3))();
