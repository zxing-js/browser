export interface IScannerControls {
  stop: () => void;
  /**
   * @experimental This is higly unstable and Torch support is not ready on browsers. Use at YOUR OWN risk.
   */
  switchTorch?: (onOff: boolean) => Promise<void>;
}
