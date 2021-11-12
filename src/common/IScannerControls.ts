export interface IScannerControls {
  /**
   * Stops the scan process loop.
   */
  stop: () => void;
  /**
   * @experimental This is highly unstable and Torch support is not ready on browsers. Use at YOUR OWN risk.
   */
  switchTorch?: (onOff: boolean) => Promise<void>;
  /**
   * Allows to apply constraints to all tracks or filtered tracks in the stream.
   * @experimental
   */
  streamVideoConstraintsApply?: (
    constraints: MediaTrackConstraints,
    trackFilter?: (track: MediaStreamTrack) => MediaStreamTrack[],
  ) => void;
  /**
   * Get the desired track constraints.
   * @experimental
   */
  streamVideoConstraintsGet?: (
    trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
  ) => MediaTrackConstraints;
  /**
   * Get the desired track settings.
   * @experimental
   */
  streamVideoSettingsGet?: (
    trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
  ) => MediaTrackSettings;
  /**
   * Get the desired track capabilities.
   * @experimental
   */
  streamVideoCapabilitiesGet?: (
    trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
  ) => MediaTrackCapabilities;
}
