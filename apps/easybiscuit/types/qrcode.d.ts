declare module "qrcode" {
  export function toString(
    text: string,
    options?: { type?: string }
  ): Promise<string>;
  export function toDataURL(
    text: string,
    options?: { width?: number }
  ): Promise<string>;
}
