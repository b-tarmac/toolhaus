declare module "react-signature-canvas" {
  import { Component, RefObject } from "react";

  export interface SignatureCanvasProps {
    ref?: React.Ref<SignatureCanvas | null>;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    backgroundColor?: string;
    penColor?: string;
    minWidth?: number;
    maxWidth?: number;
    throttle?: number;
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(type?: string): string;
  }
}
