const CLASSIC_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
];

const DEV_WORDS = [
  "async", "await", "function", "const", "let", "var", "return", "import",
  "export", "default", "interface", "type", "string", "number", "boolean",
  "array", "object", "null", "undefined", "promise", "callback", "handler",
  "component", "props", "state", "effect", "memo", "ref", "key",
];

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateLorem(options: {
  type: "paragraphs" | "sentences" | "words" | "bytes";
  count: number;
  mode: "classic" | "developer";
  startWithLorem: boolean;
}): string {
  const words = options.mode === "classic" ? CLASSIC_WORDS : DEV_WORDS;

  if (options.type === "words") {
    const result: string[] = [];
    if (options.startWithLorem && options.mode === "classic") {
      result.push("Lorem", "ipsum");
    }
    for (let i = result.length; i < options.count; i++) {
      result.push(sample(words));
    }
    return result.join(" ");
  }

  if (options.type === "bytes") {
    let out = "";
    const target = options.count;
    while (out.length < target) {
      out += sample(words) + " ";
    }
    return out.slice(0, target);
  }

  function sentence(): string {
    const len = randomInt(5, 15);
    const s: string[] = [];
    for (let i = 0; i < len; i++) {
      s.push(sample(words));
    }
    return s.join(" ").replace(/^./, (c) => c.toUpperCase()) + ".";
  }

  function paragraph(): string {
    const len = randomInt(3, 7);
    return Array.from({ length: len }, sentence).join(" ");
  }

  if (options.type === "sentences") {
    const sentences = Array.from({ length: options.count }, sentence);
    if (options.startWithLorem && options.mode === "classic") {
      sentences[0] = "Lorem ipsum dolor sit amet.";
    }
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: options.count }, paragraph);
  if (options.startWithLorem && options.mode === "classic") {
    paragraphs[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  }
  return paragraphs.join("\n\n");
}
