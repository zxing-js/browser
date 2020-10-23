export interface IBrowserCodeReaderOptions {
  /** Delay time between subsequent successful decode results. */
  delayBetweenScanSuccess?: number;
  /** Delay time between decode attempts made by the scanner. */
  delayBetweenScanAttempts?: number;
}
