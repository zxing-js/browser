import {
  ArgumentException,
  BinaryBitmap,
  ChecksumException,
  DecodeHintType,
  FormatException,
  HybridBinarizer,
  NotFoundException,
  Reader,
  Result,
} from '@zxing/library';
import { DecodeContinuouslyCallback } from './DecodeContinuouslyCallback';
import { HTMLCanvasElementLuminanceSource } from './HTMLCanvasElementLuminanceSource';
import { HTMLVisualMediaElement } from './HTMLVisualMediaElement';
import { IScannerControls } from './IScannerControls';

/**
 * If navigator is present.
 */
function hasNavigator() {
  return typeof navigator !== 'undefined';
}

/**
 * If mediaDevices under navigator is supported.
 */
function isMediaDevicesSuported() {
  return hasNavigator() && !!navigator.mediaDevices;
}

/**
 * If enumerateDevices under navigator is supported.
 */
function canEnumerateDevices() {
  return !!(isMediaDevicesSuported() && navigator.mediaDevices.enumerateDevices);
}

/**
 * Base class for browser code reader.
 */
export class BrowserCodeReader {

  /**
   * Defines what the videoElement src will be.
   *
   * @param videoElement
   * @param stream
   */
  public static addVideoSource(videoElement: HTMLVideoElement, stream: MediaStream): void {
    // Older browsers may not have `srcObject`
    try {
      // @note Throws Exception if interrupted by a new loaded request
      videoElement.srcObject = stream;
    } catch (err) {
      // @note Avoid using this in new browsers, as it is going away.
      videoElement.src = URL.createObjectURL(stream);
    }
  }

  /**
   * Checks if the given video element is currently playing.
   */
  public static isVideoPlaying(video: HTMLVideoElement): boolean {
    return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
  }

  /**
   * Searches and validates a media element.
   */
  public static getMediaElement(mediaElementId: string, type: string): HTMLVisualMediaElement {

    const mediaElement = document.getElementById(mediaElementId);

    if (!mediaElement) {
      throw new ArgumentException(`element with id '${mediaElementId}' not found`);
    }

    if (mediaElement.nodeName.toLowerCase() !== type.toLowerCase()) {
      throw new ArgumentException(`element with id '${mediaElementId}' must be an ${type} element`);
    }

    return mediaElement as HTMLVisualMediaElement;
  }

  public static createVideoElement(videoThingy?: HTMLVideoElement | string): HTMLVideoElement {

    if (videoThingy instanceof HTMLVideoElement) {
      return videoThingy;
    }

    if (typeof videoThingy === 'string') {
      return BrowserCodeReader.getMediaElement(videoThingy, 'video') as HTMLVideoElement;
    }

    if (!videoThingy && typeof document !== 'undefined') {
      const videoElement = document.createElement('video');
      videoElement.width = 200;
      videoElement.height = 200;
      return videoElement;
    }

    throw new Error('Couldn\'t get videoElement from videoSource!');
  }

  public static prepareImageElement(imageSource?: HTMLImageElement | string): HTMLImageElement {

    let imageElement: HTMLImageElement;

    if (typeof imageSource === 'undefined') {
      imageElement = document.createElement('img');
      imageElement.width = 200;
      imageElement.height = 200;
    }

    if (typeof imageSource === 'string') {
      imageElement = BrowserCodeReader.getMediaElement(imageSource, 'img') as HTMLImageElement;
    }

    if (imageSource instanceof HTMLImageElement) {
      imageElement = imageSource;
    }

    return imageElement!!;
  }

  /**
   * Sets a HTMLVideoElement for scanning or creates a new one.
   *
   * @param videoElem The HTMLVideoElement to be set.
   */
  public static prepareVideoElement(videoElem?: HTMLVideoElement | string): HTMLVideoElement {

    const videoElement = BrowserCodeReader.createVideoElement(videoElem);

    // @todo the following lines should not always be done this way, should conditionally
    // change according were we created the element or not

    // Needed for iOS 11
    videoElement.setAttribute('autoplay', 'true');
    videoElement.setAttribute('muted', 'true');
    videoElement.setAttribute('playsinline', 'true');

    return videoElement;
  }

  public static isImageLoaded(img: HTMLImageElement) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
      return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (img.naturalWidth === 0) {
      return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
  }

  /**
   * Creates a binaryBitmap based in a canvas.
   *
   * @param canvas HTML canvas element containing the image source draw.
   */
  public static createBinaryBitmapFromCanvas(canvas: HTMLCanvasElement) {

    const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
    const hybridBinarizer = new HybridBinarizer(luminanceSource);

    return new BinaryBitmap(hybridBinarizer);
  }

  /**
   * Ovewriting this allows you to manipulate the snapshot image in anyway you want before decode.
   */
  public static drawImageOnCanvas(canvasElementContext: CanvasRenderingContext2D, srcElement: HTMLVisualMediaElement) {
    canvasElementContext.drawImage(srcElement, 0, 0);
  }

  /**
   * 🖌 Prepares the canvas for capture and scan frames.
   */
  public static createCaptureCanvas(mediaElement: HTMLVisualMediaElement): HTMLCanvasElement {

    if (!mediaElement) {
      throw new ArgumentException('Cannot create a capture canvas without a media element.');
    }

    if (typeof document === 'undefined') {
      throw new Error('The page "Document" is undefined, make sure you\'re running in a browser.');
    }

    const canvasElement = document.createElement('canvas');

    const getDimensions = () => {
      if (mediaElement instanceof HTMLVideoElement) {
        return {
          height: mediaElement.videoHeight,
          width: mediaElement.videoWidth,
        };
      } else if (mediaElement instanceof HTMLImageElement) {
        return {
          height: mediaElement.naturalWidth || mediaElement.width,
          width: mediaElement.naturalHeight || mediaElement.height,
        };
      }

      throw new Error('Couldn\'t find the Source\'s dimentions!');
    };

    const { width, height } = getDimensions();

    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';
    canvasElement.width = width;
    canvasElement.height = height;

    return canvasElement;
  }

  /**
   * Just tries to play the video and logs any errors.
   * The play call is only made is the video is not already playing.
   */
  public static async tryPlayVideo(videoElement: HTMLVideoElement): Promise<boolean> {

    if (BrowserCodeReader.isVideoPlaying(videoElement)) {
      console.warn('Trying to play video that is already playing.');
      return true;
    }

    try {
      await videoElement.play();
      return true;
    } catch {
      console.warn('It was not possible to play the video.');
      return false;
    }
  }

  /**
   * Creates a canvas and draws the current image frame from the media element on it.
   *
   * @param mediaElement HTML media element to extract an image frame from.
   */
  public static createCanvasFromMediaElement(mediaElement: HTMLVisualMediaElement) {

    const canvas = BrowserCodeReader.createCaptureCanvas(mediaElement);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Couldn\'t find Canvas 2D Context.');
    }

    BrowserCodeReader.drawImageOnCanvas(ctx, mediaElement);

    return canvas;
  }

  /**
   * Creates a binaryBitmap based in some image source.
   *
   * @param mediaElement HTML element containing drawable image source.
   */
  public static createBinaryBitmapFromMediaElem(mediaElement: HTMLVisualMediaElement): BinaryBitmap {

    const canvas = BrowserCodeReader.createCanvasFromMediaElement(mediaElement);

    return BrowserCodeReader.createBinaryBitmapFromCanvas(canvas);
  }

  public static destroyImageElement(imageElement: HTMLImageElement): void {
    imageElement.src = '';
    imageElement.removeAttribute('src');
    imageElement = undefined;
  }

  /**
   * Lists all the available video input devices.
   */
  public static async listVideoInputDevices(): Promise<MediaDeviceInfo[]> {

    if (!hasNavigator()) {
      throw new Error('Can\'t enumerate devices, navigator is not present.');
    }

    if (!canEnumerateDevices()) {
      throw new Error('Can\'t enumerate devices, method not supported.');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices: MediaDeviceInfo[] = [];

    for (const device of devices) {

      const kind = device.kind as string === 'video' ? 'videoinput' : device.kind;

      if (kind !== 'videoinput') {
        continue;
      }

      const deviceId = device.deviceId || (device as any).id;
      const label = device.label || `Video device ${videoDevices.length + 1}`;
      const groupId = device.groupId;

      const videoDevice = { deviceId, label, kind, groupId } as MediaDeviceInfo;

      videoDevices.push(videoDevice);
    }

    return videoDevices;
  }

  /**
   * Let's you find a device using it's Id.
   */
  public static async findDeviceById(deviceId: string): Promise<MediaDeviceInfo | undefined> {

    const devices = await BrowserCodeReader.listVideoInputDevices();

    if (!devices) {
      return;
    }

    return devices.find((x) => x.deviceId === deviceId);
  }

  /**
   * Binds listeners and callbacks to the videoElement.
   *
   * @param element
   * @param callbackFn
   */
  protected static async playVideoOnLoad(element: HTMLVideoElement, callbackFn: EventListener): Promise<boolean> {

    /**
     * Should contain the current registered listener for video loaded-metadata,
     * used to unregister that listener when needed.
     */
    const videoCanPlayListener: EventListener = () => BrowserCodeReader.tryPlayVideo(element);

    element.addEventListener('canplay', videoCanPlayListener);
    element.addEventListener('playing', callbackFn);

    // if canplay was already fired, we won't know when to play, so just give it a try
    const isPlaying = await BrowserCodeReader.tryPlayVideo(element);

    element.removeEventListener('canplay', videoCanPlayListener);
    element.removeEventListener('playing', callbackFn);

    return isPlaying;
  }

  /**
   *
   * @param videoElement
   */
  protected static async playVideoOnLoadAsync(videoElement: HTMLVideoElement): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await BrowserCodeReader.playVideoOnLoad(videoElement, () => resolve());
      } catch (ex) {
        reject(ex);
      }
    });
  }

  /**
   * Sets the new stream and request a new decoding-with-delay.
   *
   * @param stream The stream to be shown in the video element.
   * @param decodeFn A callback for the decode method.
   */
  protected static async attachStreamToVideo(
    stream: MediaStream,
    preview?: string | HTMLVideoElement,
  ): Promise<HTMLVideoElement> {

    const videoElement = BrowserCodeReader.prepareVideoElement(preview);

    BrowserCodeReader.addVideoSource(videoElement, stream);

    await BrowserCodeReader.playVideoOnLoadAsync(videoElement);

    return videoElement;
  }

  /**
   * Unbinds a HTML video src property.
   *
   * @param videoElement
   */
  private static cleanVideoSource(videoElement: HTMLVideoElement): void {

    if (!videoElement) {
      return;
    }

    // forgets about that element 😢

    try {
      videoElement.srcObject = null;
    } catch (err) {
      videoElement.src = '';
    }

    if (videoElement) {
      videoElement.removeAttribute('src');
    }
  }

  private static _waitImageLoad(element: HTMLImageElement): Promise<void> {
    return new Promise<void>((resolve) => {

      const imageLoadedListener = () => {
        // removes the listener
        element.removeEventListener('load', imageLoadedListener);
        // resolves the load
        resolve();
      };

      element.addEventListener('load', imageLoadedListener);

      // @note we can setTimeout to reject
    });
  }

  /**
   * Creates an instance of BrowserCodeReader.
   * @param {Reader} reader The reader instance to decode the barcode
   * @param {number} [delayBetweenScanSuccess=500] Delay time between subsequent successful decode results.
   * @param hints Holds the hints the user sets for the Reader.
   * @param {number} [delayBetweenScanAttempts=500] Delay time between decode attempts made by the scanner.
   *
   * @memberOf BrowserCodeReader
   */
  public constructor(
    protected readonly reader: Reader,
    public readonly delayBetweenScanSuccess: number = 500,
    public readonly hints?: Map<DecodeHintType, any>,
    public readonly delayBetweenScanAttempts: number = 500,
  ) { }

  /**
   * In one attempt, tries to decode the barcode from the device specified by deviceId
   * while showing the video in the specified video element.
   *
   * @param deviceId the id of one of the devices obtained after calling getVideoInputDevices.
   *  Can be undefined, in this case it will decode from one of the available devices,
   *  preffering the main camera (environment facing) if available.
   * @param videoSource the video element in page where to show the video while decoding.
   *  Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   * @returns The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromVideoDevice(deviceId?: string, videoSource?: string | HTMLVideoElement): Promise<Result> {

    let videoConstraints: MediaTrackConstraints;

    if (!deviceId) {
      videoConstraints = { facingMode: 'environment' };
    } else {
      videoConstraints = { deviceId: { exact: deviceId } };
    }

    const constraints: MediaStreamConstraints = { video: videoConstraints };

    return await this.decodeOnceFromConstraints(constraints, videoSource);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given
   * constraints while showing the video in the specified video element.
   *
   * @param constraints the media stream constraints to get s valid media stream to decode from
   * @param videoSource the video element in page where to show the video while decoding.
   *  Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   * @returns The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromConstraints(
    constraints: MediaStreamConstraints,
    videoSource?: string | HTMLVideoElement,
  ): Promise<Result> {

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return await this.decodeOnceFromStream(stream, videoSource);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given
   * constraints while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [video] the video element in page where to show the video while decoding.
   *  Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   * @returns {Promise<Result>} The decoding result.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeOnceFromStream(stream: MediaStream, preview?: string | HTMLVideoElement): Promise<Result> {

    const receivedPreview = Boolean(preview);

    const video = await BrowserCodeReader.attachStreamToVideo(stream, preview);

    try {
      const result = await this.decodeOnce(video);
      return result;
    } finally {
      if (!receivedPreview) {
        BrowserCodeReader.cleanVideoSource(video);
      }
    }
  }

  /**
   * Continuously tries to decode the barcode from the device specified by device while showing
   * the video in the specified video element.
   *
   * @param {string|null} [deviceId] the id of one of the devices obtained after calling
   *  getVideoInputDevices. Can be undefined, in this case it will decode from one of the
   *  available devices, preffering the main camera (environment facing) if available.
   * @param {string|HTMLVideoElement|null} [video] the video element in page where to show the video
   *  while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromVideoDevice(
    deviceId: string | undefined,
    previewElem: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    let videoConstraints: MediaTrackConstraints;

    if (!deviceId) {
      videoConstraints = { facingMode: 'environment' };
    } else {
      videoConstraints = { deviceId: { exact: deviceId } };
    }

    const constraints: MediaStreamConstraints = { video: videoConstraints };

    return await this.decodeFromConstraints(constraints, previewElem, callbackFn);
  }

  /**
   * Continuously tries to decode the barcode from a stream obtained from the given constraints
   * while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [previewElem] the video element in page where to show the video while
   *  decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in
   *  which case no video will be shown.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromConstraints(
    constraints: MediaStreamConstraints,
    previewElem: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return await this.decodeFromStream(stream, previewElem, callbackFn);
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given constraints
   * while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [preview] the video element in page where to show the video
   *  while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   *
   * @memberOf BrowserCodeReader
   */
  public async decodeFromStream(
    stream: MediaStream,
    preview: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    const previewReceived = Boolean(preview);

    const video = await BrowserCodeReader.attachStreamToVideo(stream, preview);

    // we receive a stream from the user, it's not our job to dispose it

    const finalizeCallback = () => {
      if (!previewReceived) {
        // @todo find a way to check if decodeContinuously ended
        BrowserCodeReader.cleanVideoSource(video);
      }
    };

    const controls = this.decodeContinuously(video, callbackFn, finalizeCallback);

    return controls;
  }

  /**
   * Decodes something from an image HTML element.
   */
  public async decodeFromImageElement(source: string | HTMLImageElement): Promise<Result> {

    if (!source) {
      throw new ArgumentException('An image element must be provided.');
    }

    const element = BrowserCodeReader.prepareImageElement(source);

    // onLoad will remove it's callback once done
    // we do not need to dispose or destroy the image
    // since it came from the user

    return await this._decodeOnLoadImage(element);
  }

  /**
   * Decodes something from an image HTML element.
   */
  public async decodeOnceFromVideoElement(source: string | HTMLVideoElement): Promise<Result> {

    if (!source) {
      throw new ArgumentException('A video element must be provided.');
    }

    // we do not create a video element
    const element = BrowserCodeReader.prepareVideoElement(source);

    // plays the video
    await BrowserCodeReader.playVideoOnLoadAsync(element);

    // starts decoding after played the video
    return await this.decodeOnce(element);
  }

  /**
   * Decodes something from an image HTML element.
   */
  public async decodeFromVideoElement(
    source: string | HTMLVideoElement,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    if (!source) {
      throw new ArgumentException('A video element must be provided.');
    }

    // we do not create a video element
    const element = BrowserCodeReader.prepareVideoElement(source);

    // plays the video
    await BrowserCodeReader.playVideoOnLoadAsync(element);

    // starts decoding after played the video
    return this.decodeContinuously(element, callbackFn);
  }

  /**
   * Decodes an image from a URL.
   */
  public async decodeFromImageUrl(url?: string): Promise<Result> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    const element = BrowserCodeReader.prepareImageElement();

    const task = this._decodeOnLoadImage(element);

    // loads the image.
    element.src = url;

    try {
      // it waits the task so we can destroy the created image after
      return await task;
    } finally {
      // we created this element, so we destroy it
      BrowserCodeReader.destroyImageElement(element);
    }
  }

  /**
   * Decodes a video from a URL.
   */
  public async decodeOnceFromVideoUrl(url: string): Promise<Result> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    // creates a new element
    const element = BrowserCodeReader.prepareVideoElement();

    // starts loading the video
    element.src = url;

    const task = this.decodeOnceFromVideoElement(element);

    try {
      // it waits the task so we can destroy the created image after
      return await task;
    } finally {
      // we created this element, so we destroy it
      BrowserCodeReader.cleanVideoSource(element);
    }
  }

  /**
   * Decodes a video from a URL until it ends.
   *
   * @experimental
   */
  public decodeFromVideoUrl(
    url: string,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    // creates a new element
    const element = BrowserCodeReader.prepareVideoElement();

    // starts loading the video
    element.src = url;

    const controls = this.decodeFromVideoElement(element, callbackFn);

    // @todo dispose created video element

    return controls;
  }

  /**
   * Tries to decode from the video input until it finds some value.
   */
  public decodeOnce(
    element: HTMLVideoElement,
    retryIfNotFound = true,
    retryIfChecksumError = true,
    retryIfFormatError = true,
  ): Promise<Result> {
    return new Promise((resolve, reject) => {

      this.decodeContinuously(element, (result, error, controls) => {

        if (result) {
          // good result, returning
          resolve(result);
          controls.stop();
          return;
        }

        if (error) {

          // checks if it should retry

          if (error instanceof NotFoundException && retryIfNotFound) { return; }
          if (error instanceof ChecksumException && retryIfChecksumError) { return; }
          if (error instanceof FormatException && retryIfFormatError) { return; }

          // not re-trying

          controls.stop(); // stops scan loop
          reject(error); // returns the error
        }
      });

    });
  }

  /**
   * Continuously decodes from video input.
   */
  public decodeContinuously(
    element: HTMLVisualMediaElement,
    callbackFn: DecodeContinuouslyCallback,
    finalizeCallback?: (error?: Error) => void,
  ): IScannerControls {

    /**
     * The HTML canvas element, used to draw the video or image's frame for decoding.
     */
    const captureCanvas = BrowserCodeReader.createCaptureCanvas(element);

    /**
     * The HTML canvas element context.
     */
    const captureCanvasContext = captureCanvas.getContext('2d');

    if (!captureCanvasContext) {
      throw new Error('Couldn\'t create canvas for visual element scan.');
    }

    let stopScan = false;
    let lastTimeoutId: number;

    const stop = () => {
      stopScan = true;
      clearTimeout(lastTimeoutId);
      if (finalizeCallback) { finalizeCallback(); }
    };

    const controls = { stop };

    const loop = () => {

      if (stopScan) {
        // no need to clear timeouts as none was create yet in this scope.
        return;
      }

      try {
        BrowserCodeReader.drawImageOnCanvas(captureCanvasContext, element);
        const result = this.decodeFromCanvas(captureCanvas);
        callbackFn(result, undefined, controls);
        lastTimeoutId = window.setTimeout(loop, this.delayBetweenScanSuccess);
      } catch (error) {

        callbackFn(undefined, error, controls);

        const isChecksumError = error instanceof ChecksumException;
        const isFormatError = error instanceof FormatException;
        const isNotFound = error instanceof NotFoundException;

        if (isChecksumError || isFormatError || isNotFound) {
          // trying again
          lastTimeoutId = window.setTimeout(loop, this.delayBetweenScanAttempts);
          return;
        }

        // not trying again
        if (finalizeCallback) { finalizeCallback(error); }
      }
    };

    loop();

    return controls;
  }

  /**
   * Gets the BinaryBitmap for ya! (and decodes it)
   */
  public decode(element: HTMLVisualMediaElement): Result {

    // get binary bitmap for decode function
    const binaryBitmap = BrowserCodeReader.createBinaryBitmapFromMediaElem(element);

    return this.decodeBitmap(binaryBitmap);
  }

  /**
   * @experimental
   * Decodes some barcode from a canvas!
   */
  public decodeFromCanvas(canvas: HTMLCanvasElement): Result {

    const binaryBitmap = BrowserCodeReader.createBinaryBitmapFromCanvas(canvas);

    return this.decodeBitmap(binaryBitmap);
  }

  /**
   * Call the encapsulated readers decode
   */
  public decodeBitmap(binaryBitmap: BinaryBitmap): Result {
    return this.reader.decode(binaryBitmap, this.hints);
  }

  private async _decodeOnLoadImage(element: HTMLImageElement): Promise<Result> {

    const isImageLoaded = BrowserCodeReader.isImageLoaded(element);

    if (!isImageLoaded) {
      await BrowserCodeReader._waitImageLoad(element);
    }

    try {
      return this.decode(element);
    } catch (error) {
      throw error;
    }
  }
}
