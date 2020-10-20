import { Exception, Result } from '@zxing/library';

/**
 * Callback format for continuous decode scan.
 */
export type DecodeContinuouslyCallback = (result?: Result, error?: Exception) => any;
