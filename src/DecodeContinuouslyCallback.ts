import { Exception, Result } from '@zxing/library';
import { IScannerControls } from './IScannerControls';

/**
 * Callback format for continuous decode scan.
 */
export type DecodeContinuouslyCallback = (
  result: Result | undefined,
  error: Exception | undefined,
  controls: IScannerControls,
) => void;
