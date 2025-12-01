declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": ModelViewerProps;
  }
}

interface ModelViewerProps {
  src?: string;
  alt?: string;
  "auto-rotate"?: string | boolean;
  "camera-controls"?: string | boolean;
  ar?: string | boolean;
  "shadow-intensity"?: string | number;
  exposure?: string | number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
