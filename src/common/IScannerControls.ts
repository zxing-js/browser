export interface IScannerControls {
  stop: () => void;
  switchTorch?: (onOff: boolean) => void;
}
