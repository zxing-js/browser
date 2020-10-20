/**
 * Video input device metadata containing the id and label of the device if available.
 */
export class VideoInputDevice implements MediaDeviceInfo {

  /** @inheritdoc */
  public readonly kind = 'videoinput';

  /** @inheritdoc */
  public readonly groupId: string;

  /**
   * Creates an instance of VideoInputDevice.
   *
   * @param {string} deviceId the video input device id
   * @param {string} label the label of the device if available
   */
  public constructor(public deviceId: string, public label: string, groupId?: string) {
    this.groupId = groupId || '';
  }

  /** @inheritdoc */
  public toJSON() {
    return {
      deviceId: this.deviceId,
      groupId: this.groupId,
      kind: this.kind,
      label: this.label,
    };
  }
}
