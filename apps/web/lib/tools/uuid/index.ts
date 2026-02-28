import { ulid } from "ulid";
import { nanoid, customAlphabet } from "nanoid";

export type IdType = "uuid-v4" | "ulid" | "nanoid";

export function generateIds(
  type: IdType,
  options: {
    count: number;
    uppercase?: boolean;
    nanoidSize?: number;
    nanoidAlphabet?: string;
  }
): string[] {
  const maxCount = options.count;
  const gen: Record<IdType, () => string> = {
    "uuid-v4": () => {
      const id = crypto.randomUUID();
      return options.uppercase ? id.toUpperCase() : id;
    },
    ulid: () => ulid(),
    nanoid: () => {
      const size = options.nanoidSize ?? 21;
      if (options.nanoidAlphabet) {
        const fn = customAlphabet(options.nanoidAlphabet, size);
        return fn();
      }
      return nanoid(size);
    },
  };
  return Array.from({ length: Math.min(maxCount, 10000) }, gen[type]);
}
