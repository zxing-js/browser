/**
 * If navigator is present.
 */
export function hasNavigator() {
  return typeof navigator !== 'undefined';
}
/**
 * If mediaDevices under navigator is supported.
 */
function isMediaDevicesSupported() {
  return hasNavigator() && !!navigator.mediaDevices;
}
/**
 * If enumerateDevices under navigator is supported.
 */
export function canEnumerateDevices() {
  return !!(isMediaDevicesSupported() && navigator.mediaDevices.enumerateDevices);
}
