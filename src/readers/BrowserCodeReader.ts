import {
  ArgumentException,
  BarcodeFormat,
  BinaryBitmap,
  ChecksumException,
  DecodeHintType,
  FormatException,
  HybridBinarizer,
  NotFoundException,
  Reader,
  Result,
} from '@zxing/library';
import { DecodeContinuouslyCallback } from '../common/DecodeContinuouslyCallback';
import { HTMLCanvasElementLuminanceSource } from '../common/HTMLCanvasElementLuminanceSource';
import { HTMLVisualMediaElement } from '../common/HTMLVisualMediaElement';
import { IScannerControls } from '../common/IScannerControls';
import { canEnumerateDevices, hasNavigator } from '../common/navigator-utils';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

const defaultOptions: IBrowserCodeReaderOptions = {
  delayBetweenScanAttempts: 500,
  delayBetweenScanSuccess: 500,
  tryPlayVideoTimeout: 5000,
};

/**
 * Base class for browser code reader.
 */
export class BrowserCodeReader {

  /**
   * Allows to change the possible formats the decoder should
   * search for while scanning some image. Useful for changing
   * the possible formats during BrowserCodeReader::scan.
   */
  set possibleFormats(formats: BarcodeFormat[]) {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  }

  /**
   * Defines what the videoElement src will be.
   *
   * @param videoElement
   * @param stream The stream to be added as a source.
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
   * Enables or disables the torch in a media stream.
   *
   * @experimental This doesn't work accross all browsers and is still a Draft.
   */
  public static async mediaStreamSetTorch(track: MediaStreamTrack, onOff: boolean) {
    await track.applyConstraints({
      advanced: [{
        fillLightMode: onOff ? 'flash' : 'off',
        torch: onOff ? true : false,
      } as any],
    });
  }

  /**
   * Checks if the stream has torch support.
   */
  public static mediaStreamIsTorchCompatible(params: MediaStream) {

    const tracks = params.getVideoTracks();

    for (const track of tracks) {
      if (BrowserCodeReader.mediaStreamIsTorchCompatibleTrack(track)) {
        return true;
      }
    }

    return false;
  }

  /**
   *
   * @param track The media stream track that will be checked for compatibility.
   */
  public static mediaStreamIsTorchCompatibleTrack(track: MediaStreamTrack) {
    try {
      const capabilities = track.getCapabilities();
      return 'torch' in capabilities;
    } catch (err) {
      // some browsers may not be compatible with ImageCapture
      // so we are ignoring this for now.
      // tslint:disable-next-line:no-console
      console.error(err);
      // tslint:disable-next-line:no-console
      console.warn('Your browser may be not fully compatible with WebRTC and/or ImageCapture specs. Torch will not be available.');
      return false;
    }
  }

  /**
   * Checks if the given video element is currently playing.
   */
  public static isVideoPlaying(video: HTMLVideoElement): boolean {
    return video.currentTime > 0 && !video.paused && video.readyState > 2;
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

  /**
   * Receives a source and makes sure to return a Video Element from it or fail.
   */
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

  /**
   * Receives a source and makes sure to return an Image Element from it or fail.
   */
  public static prepareImageElement(imageSource?: HTMLImageElement | string): HTMLImageElement {

    if (imageSource instanceof HTMLImageElement) {
      return imageSource;
    }

    if (typeof imageSource === 'string') {
      return BrowserCodeReader.getMediaElement(imageSource, 'img') as HTMLImageElement;
    }

    if (typeof imageSource === 'undefined') {
      const imageElement = document.createElement('img');
      imageElement.width = 200;
      imageElement.height = 200;
      return imageElement;
    }

    throw new Error('Couldn\'t get imageElement from imageSource!');
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

  /**
   * Checks if and HTML image is loaded.
   */
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

  public static getMediaElementDimensions(mediaElement: HTMLVisualMediaElement) {
    if (mediaElement instanceof HTMLVideoElement) {
      return {
        height: mediaElement.videoHeight,
        width: mediaElement.videoWidth,
      };
    }

    if (mediaElement instanceof HTMLImageElement) {
      return {
        height: mediaElement.naturalHeight || mediaElement.height,
        width: mediaElement.naturalWidth || mediaElement.width,
      };
    }

    throw new Error('Couldn\'t find the Source\'s dimentions!');
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

    const { width, height } = BrowserCodeReader.getMediaElementDimensions(mediaElement);

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

    if (videoElement?.ended) {
      // tslint:disable-next-line:no-console
      console.error('Trying to play video that has ended.');
      return false;
    }

    if (BrowserCodeReader.isVideoPlaying(videoElement)) {
      // tslint:disable-next-line:no-console
      console.warn('Trying to play video that is already playing.');
      return true;
    }

    try {
      await videoElement.play();
      return true;
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.warn('It was not possible to play the video.', error);
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
   * Unbinds a HTML video src property.
   */
  public static cleanVideoSource(videoElement: HTMLVideoElement): void {

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

  /**
   * Stops all media streams that are created.
   */
  public static releaseAllStreams() {
    if (BrowserCodeReader.streamTracker.length !== 0) {
      // tslint:disable-next-line:no-console
      BrowserCodeReader.streamTracker.forEach((mediaStream) => {
        mediaStream.getTracks().forEach((track) => track.stop());
     });
    }
    BrowserCodeReader.streamTracker = [];
  }

  /**
   * Waits for a video to load and then hits play on it.
   * To accomplish that, it binds listeners and callbacks to the video element.
   *
   * @param element The video element.
   * @param callbackFn Callback invoked when the video is played.
   */
  protected static async playVideoOnLoadAsync(element: HTMLVideoElement, timeout: number): Promise<boolean> {

    // if canplay was already fired, we won't know when to play, so just give it a try
    const isPlaying = await BrowserCodeReader.tryPlayVideo(element);

    if (isPlaying) {
      return true;
    }

    return new Promise<boolean>((resolve, reject) => {

      // waits 3 seconds or rejects.
      const timeoutId = setTimeout(() => {
        if (BrowserCodeReader.isVideoPlaying(element)) {
          // if video is playing then we had success, just ignore
          return;
        }
        reject(false);
        element.removeEventListener('canplay', videoCanPlayListener);
      }, timeout);

      /**
       * Should contain the current registered listener for video loaded-metadata,
       * used to unregister that listener when needed.
       */
      const videoCanPlayListener: EventListener = () => {
        BrowserCodeReader.tryPlayVideo(element).then((hasPlayed) => {
          clearTimeout(timeoutId);
          element.removeEventListener('canplay', videoCanPlayListener);
          resolve(hasPlayed);
        });
      };

      // both should be unregistered after called
      element.addEventListener('canplay', videoCanPlayListener);
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
    previewPlayTimeout: number = 5000,
  ): Promise<HTMLVideoElement> {

    const videoElement = BrowserCodeReader.prepareVideoElement(preview);

    BrowserCodeReader.addVideoSource(videoElement, stream);

    await BrowserCodeReader.playVideoOnLoadAsync(videoElement, previewPlayTimeout);

    return videoElement;
  }

  /**
   * Keeps track to created media streams.
   * @private there is no need this array to be accessible from outside.
   */
  private static streamTracker: MediaStream[] = [];

  /**
   * Returns a Promise that resolves when the given image element loads.
   */
  private static _waitImageLoad(element: HTMLImageElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      const timeout = 10000;

      // waits 10 seconds or rejects.
      const timeoutId = setTimeout(() => {
        if (BrowserCodeReader.isImageLoaded(element)) {
          // if video is playing then we had success, just ignore
          return;
        }
        // removes the listener
        element.removeEventListener('load', imageLoadedListener);
        // rejects the load
        reject();
      }, timeout);

      const imageLoadedListener = () => {
        clearTimeout(timeoutId);
        // removes the listener
        element.removeEventListener('load', imageLoadedListener);
        // resolves the load
        resolve();
      };

      element.addEventListener('load', imageLoadedListener);
    });
  }

  /**
   * Checks if the `callbackFn` is defined, otherwise throws.
   */
  private static checkCallbackFnOrThrow(callbackFn: DecodeContinuouslyCallback) {
    if (!callbackFn) {
      throw new ArgumentException('`callbackFn` is a required parameter, you cannot capture results without it.');
    }
  }

  /**
   * Standard method to dispose a media stream object.
   */
  private static disposeMediaStream(stream: MediaStream) {
    stream.getVideoTracks().forEach((x) => x.stop());
    stream = undefined;
  }

  /**
   * BrowserCodeReader specific configuration options.
   */
  protected readonly options: IBrowserCodeReaderOptions;

  /**
   * Creates an instance of BrowserCodeReader.
   * @param {Reader} reader The reader instance to decode the barcode
   * @param hints Holds the hints the user sets for the Reader.
   */
  public constructor(
    protected readonly reader: Reader,
    public hints: Map<DecodeHintType, any> = new Map<DecodeHintType, any>(),
    options: IBrowserCodeReaderOptions = {},
  ) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Gets the BinaryBitmap for ya! (and decodes it)
   */
  public decode(element: HTMLVisualMediaElement): Result {

    // get binary bitmap for decode function
    const canvas = BrowserCodeReader.createCanvasFromMediaElement(element);

    return this.decodeFromCanvas(canvas);
  }

  /**
   * Call the encapsulated readers decode
   */
  public decodeBitmap(binaryBitmap: BinaryBitmap): Result {
    return this.reader.decode(binaryBitmap, this.hints);
  }

  /**
   * Decodes some barcode from a canvas!
   */
  public decodeFromCanvas(canvas: HTMLCanvasElement): Result {

    const binaryBitmap = BrowserCodeReader.createBinaryBitmapFromCanvas(canvas);

    return this.decodeBitmap(binaryBitmap);
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
   * Decodes an image from a URL.
   */
  public async decodeFromImageUrl(url?: string): Promise<Result> {

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    const element = BrowserCodeReader.prepareImageElement();

    // loads the image.
    element.src = url;

    try {
      // it waits the task so we can destroy the created image after
      return await this.decodeFromImageElement(element);
    } finally {
      // we created this element, so we destroy it
      BrowserCodeReader.destroyImageElement(element);
    }
  }

  /**
   * Continuously tries to decode the barcode from a stream obtained from the given constraints
   * while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [previewElem] the video element in page where to show the video while
   *  decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined, in
   *  which case no video will be shown.
   */
  public async decodeFromConstraints(
    constraints: MediaStreamConstraints,
    previewElem: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

    const stream = await this.getUserMedia(constraints);
    try {
      return await this.decodeFromStream(stream, previewElem, callbackFn);
    } catch (error) {
      BrowserCodeReader.disposeMediaStream(stream);
      throw error;
    }
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given constraints
   * while showing the video in the specified video element.
   *
   * @param {MediaStream} [constraints] the media stream constraints to get s valid media stream to decode from
   * @param {string|HTMLVideoElement} [preview] the video element in page where to show the video
   *  while decoding. Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   */
  public async decodeFromStream(
    stream: MediaStream,
    preview: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

    const timeout = this.options.tryPlayVideoTimeout;

    const video = await BrowserCodeReader.attachStreamToVideo(stream, preview, timeout);

    // IF we receive a stream from the user, it's not our job to dispose it

    const finalizeCallback = () => {
      // stops video tracks and releases the stream reference
      BrowserCodeReader.disposeMediaStream(stream);
      // this video was just a preview, so in order
      // to release the stream we gotta stop showing
      // it (the stream) in the video element
      BrowserCodeReader.cleanVideoSource(video);
    };

    const originalControls = this.scan(video, callbackFn, finalizeCallback);

    const videoTracks = stream.getVideoTracks();

    const controls: IScannerControls = {
      ...originalControls,

      stop() {
        originalControls.stop();
      },

      async streamVideoConstraintsApply(
        constraints: MediaTrackConstraints,
        trackFilter?: (track: MediaStreamTrack) => MediaStreamTrack[],
      ) {
        const tracks = trackFilter ? videoTracks.filter(trackFilter) : videoTracks;
        for (const track of tracks) {
          await track.applyConstraints(constraints);
        }
      },

      streamVideoConstraintsGet(
        trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
      ) {
        return videoTracks.find(trackFilter).getConstraints();
      },

      streamVideoSettingsGet(
        trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
      ) {
        return videoTracks.find(trackFilter).getSettings();
      },

      streamVideoCapabilitiesGet(
        trackFilter: (track: MediaStreamTrack) => MediaStreamTrack[],
      ) {
        return videoTracks.find(trackFilter).getCapabilities();
      },

    };

    const isTorchAvailable = BrowserCodeReader.mediaStreamIsTorchCompatible(stream);

    if (isTorchAvailable) {

      const torchTrack = videoTracks
        ?.find((t) => BrowserCodeReader.mediaStreamIsTorchCompatibleTrack(t));

      const switchTorch = async (onOff: boolean) => {
        await BrowserCodeReader.mediaStreamSetTorch(torchTrack, onOff);
      };

      controls.switchTorch = switchTorch;

      const stop = () => {
        originalControls.stop();
        switchTorch(false);
      };

      controls.stop = stop;
    }

    return controls;
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
   */
  public async decodeFromVideoDevice(
    deviceId: string | undefined,
    previewElem: string | HTMLVideoElement | undefined,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

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
   * Decodes something from an image HTML element.
   */
  public async decodeFromVideoElement(
    source: string | HTMLVideoElement,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

    if (!source) {
      throw new ArgumentException('A video element must be provided.');
    }

    // we do not create a video element
    const element = BrowserCodeReader.prepareVideoElement(source);

    const timeout = this.options.tryPlayVideoTimeout;

    // plays the video
    await BrowserCodeReader.playVideoOnLoadAsync(element, timeout);

    // starts decoding after played the video
    return this.scan(element, callbackFn);
  }

  /**
   * Decodes a video from a URL until it ends.
   */
  public async decodeFromVideoUrl(
    url: string,
    callbackFn: DecodeContinuouslyCallback,
  ): Promise<IScannerControls> {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

    if (!url) {
      throw new ArgumentException('An URL must be provided.');
    }

    // creates a new element
    const element = BrowserCodeReader.prepareVideoElement();

    // starts loading the video
    element.src = url;

    const finalizeCallback = () => {
      // dispose created video element
      BrowserCodeReader.cleanVideoSource(element);
    };

    const timeout = this.options.tryPlayVideoTimeout;

    // plays the video
    await BrowserCodeReader.playVideoOnLoadAsync(element, timeout);

    // starts decoding after played the video
    const controls = this.scan(element, callbackFn, finalizeCallback);

    return controls;
  }

  /**
   * In one attempt, tries to decode the barcode from a stream obtained from the given
   * constraints while showing the video in the specified video element.
   *
   * @param constraints the media stream constraints to get s valid media stream to decode from
   * @param videoSource the video element in page where to show the video while decoding.
   *  Can be either an element id or directly an HTMLVideoElement. Can be undefined,
   *  in which case no video will be shown.
   *  The decoding result.
   */
  public async decodeOnceFromConstraints(
    constraints: MediaStreamConstraints,
    videoSource?: string | HTMLVideoElement,
  ): Promise<Result> {

    const stream = await this.getUserMedia(constraints);

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
   */
  public async decodeOnceFromStream(stream: MediaStream, preview?: string | HTMLVideoElement): Promise<Result> {

    const receivedPreview = Boolean(preview);

    const video = await BrowserCodeReader.attachStreamToVideo(stream, preview);

    try {
      const result = await this.scanOneResult(video);
      return result;
    } finally {
      if (!receivedPreview) {
        BrowserCodeReader.cleanVideoSource(video);
      }
    }
  }

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
   * Decodes something from an image HTML element.
   */
  public async decodeOnceFromVideoElement(source: string | HTMLVideoElement): Promise<Result> {

    if (!source) {
      throw new ArgumentException('A video element must be provided.');
    }

    // we do not create a video element
    const element = BrowserCodeReader.prepareVideoElement(source);

    const timeout = this.options.tryPlayVideoTimeout;

    // plays the video
    await BrowserCodeReader.playVideoOnLoadAsync(element, timeout);

    // starts decoding after played the video
    return await this.scanOneResult(element);
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
   * Tries to decode from the video input until it finds some value.
   */
  public scanOneResult(
    element: HTMLVisualMediaElement,
    retryIfNotFound = true,
    retryIfChecksumError = true,
    retryIfFormatError = true,
  ): Promise<Result> {
    return new Promise((resolve, reject) => {

      // reuses the scan API, but returns at the first successful result
      this.scan(element, (result, error, controls) => {

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
   *
   * @param element HTML element to scan/decode from. It will not be disposed or destroyed.
   * @param callbackFn Called after every scan attempt, being it successful or errored.
   * @param finalizeCallback Called after scan proccess reaches the end or stop is called.
   */
  public scan(
    element: HTMLVisualMediaElement,
    callbackFn: DecodeContinuouslyCallback,
    finalizeCallback?: (error?: Error) => void,
  ): IScannerControls {

    BrowserCodeReader.checkCallbackFnOrThrow(callbackFn);

    /**
     * The HTML canvas element, used to draw the video or image's frame for decoding.
     */
    let captureCanvas = BrowserCodeReader.createCaptureCanvas(element);

    /**
     * The HTML canvas element context.
     */
    let captureCanvasContext = captureCanvas.getContext('2d');

    // cannot proceed w/o this
    if (!captureCanvasContext) {
      throw new Error('Couldn\'t create canvas for visual element scan.');
    }

    const disposeCanvas = () => {
      captureCanvasContext = undefined;
      captureCanvas = undefined;
    };

    let stopScan = false;
    let lastTimeoutId: null | ReturnType<typeof setTimeout>;

    // can be called to break the scan loop
    const stop = () => {
      stopScan = true;
      clearTimeout(lastTimeoutId);
      disposeCanvas();
      if (finalizeCallback) { finalizeCallback(); }
    };

    // created for extensibility
    const controls = { stop };

    // this async loop allows infinite (or almost? maybe) scans
    const loop = () => {

      if (stopScan) {
        // no need to clear timeouts as none was create yet in this scope.
        return;
      }

      try {
        BrowserCodeReader.drawImageOnCanvas(captureCanvasContext, element);
        const result = this.decodeFromCanvas(captureCanvas);
        callbackFn(result, undefined, controls);
        lastTimeoutId = setTimeout(loop, this.options.delayBetweenScanSuccess);
      } catch (error) {

        callbackFn(undefined, error, controls);

        const isChecksumError = error instanceof ChecksumException;
        const isFormatError = error instanceof FormatException;
        const isNotFound = error instanceof NotFoundException;

        if (isChecksumError || isFormatError || isNotFound) {
          // trying again
          lastTimeoutId = setTimeout(loop, this.options.delayBetweenScanAttempts);
          return;
        }

        // not trying again
        disposeCanvas();
        if (finalizeCallback) { finalizeCallback(error); }
      }
    };

    // starts the async loop
    loop();

    return controls;
  }

  /**
   * Waits for the image to load and then tries to decode it.
   */
  private async _decodeOnLoadImage(element: HTMLImageElement): Promise<Result> {

    const isImageLoaded = BrowserCodeReader.isImageLoaded(element);

    if (!isImageLoaded) {
      await BrowserCodeReader._waitImageLoad(element);
    }

    return this.decode(element);
  }

  /**
   * Get MediaStream from browser to be used.
   * @param constraints constraints the media stream constraints to get s valid media stream to decode from.
   * @private For private use.
   */
  private async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    BrowserCodeReader.streamTracker.push(stream);
    return stream;
  }
}
