// @ts-expect-error spark-md5 has no types
import SparkMD5 from "spark-md5";

async function shaHash(input: string, algo: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    algo,
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashAll(input: string): Promise<Record<string, string>> {
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    shaHash(input, "SHA-1"),
    shaHash(input, "SHA-256"),
    shaHash(input, "SHA-384"),
    shaHash(input, "SHA-512"),
  ]);
  return {
    MD5: SparkMD5.hash(input),
    "SHA-1": sha1,
    "SHA-256": sha256,
    "SHA-384": sha384,
    "SHA-512": sha512,
  };
}

function bufToHex(b: ArrayBuffer): string {
  return Array.from(new Uint8Array(b))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashFile(file: File): Promise<Record<string, string>> {
  const buffer = await file.arrayBuffer();
  const [sha1, sha256, sha512] = await Promise.all([
    crypto.subtle.digest("SHA-1", buffer),
    crypto.subtle.digest("SHA-256", buffer),
    crypto.subtle.digest("SHA-512", buffer),
  ]);
  return {
    MD5: SparkMD5.ArrayBuffer.hash(buffer),
    "SHA-1": bufToHex(sha1),
    "SHA-256": bufToHex(sha256),
    "SHA-512": bufToHex(sha512),
  };
}
