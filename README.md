[<img align="right" src="https://raw.github.com/wiki/zxing/zxing/zxing-logo.png"/>][1]

# ZXing

## What is ZXing?

> [ZXing][1] ("zebra crossing") is an open-source, multi-format 1D/2D barcode image processing library implemented in Java, with ports to other languages.

## Browser layer

This is a library for enabling you to use with ease the ZXing for JS library on the browser. It includes features like scanning an `<img>` element, as well as `<video>`, images and videos from URLs and also it helps handling webcam use for scanning directly from a hardware connected camera. It does not offers support to any physical barcode readers or things like that.

See @zxing-js/library for the complete API including decoding classes and use outside of the browser.

See @zxing-js/ngx-scanner for using the library in Angular.

See @zxing-js/text-encoding for special character support in barcodes.

## Usage (how to use)

Installation, import into app and usage examples in this section.

### Instalation

Install via yarn, npm, etc:

```bash
yarn add @zxing/browser
```

```bash
npm i @zxing/browser
```

Or just import an script tag from your favorite NPM registry connected CDN:

```html
<!-- loading ZXingBrowser via UNPKG -->
<script type="text/javascript" src="https://unpkg.com/@zxing/browser@latest"></script>
```

### How to import into your app

#### ES6 modules

```html
<script type="module">
  import { BrowserQRCodeReader } from '@zxing/browser';

  const codeReader = new BrowserQRCodeReader();

  // do something with codeReader...

</script>
```

##### Or asynchronously

```html
<script type="module">
  import('@zxing/browser').then({ BrowserQRCodeReader } => {

    const codeReader = new BrowserQRCodeReader();

    // do something with codeReader...

  });
</script>
```

#### With AMD

```html
<script type="text/javascript" src="https://unpkg.com/requirejs"></script>
<script type="text/javascript">
  require(['@zxing/browser'], ZXingBrowser => {

    const codeReader = new ZXingBrowser.BrowserQRCodeReader();

    // do something with codeReader...

  });
</script>
```

#### With UMD

```html
<script type="text/javascript" src="https://unpkg.com/@zxing/browser@latest"></script>
<script type="text/javascript">
  window.addEventListener('load', () => {

    const codeReader = new ZXingBrowser.BrowserQRCodeReader();

    // do something with codeReader...

  });
</script>
```

### Using the API

Examples here will assume you already imported ZXingBrowser into your app.

#### Scan from webcam

Continuous scan (runs and decodes barcodes until you stop it):

```typescript
const codeReader = new BrowserQRCodeReader();

const videoInputDevices = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();

// choose your media device (webcam, frontal camera, back camera, etc.)
const selectedDeviceId = videoInputDevices[0].deviceId;

console.log(`Started decode from camera with id ${selectedDeviceId}`);

const previewElem = document.querySelector('#test-area-qr-code-webcam > video');

// you can use the controls to stop() the scan or switchTorch() if available
const controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, error, controls) => {
  // use the result and error values to choose your actions
  // you can also use controls API in this scope like the controls
  // returned from the method.
});

// stops scanning after 20 seconds
setTimeout(() => controls.stop(), 20000);
```

You can also use `decodeFromConstraints` instead of `decodeFromVideoDevice` to pass your own constraints for the method choose the device you want directly from your constraints.

Also, `decodeOnceFromVideoDevice` is available too so you can `await` the method until it detects the first barcode.

### Scan from video or image URL

```javascript
const codeReader = new ZXingBrowser.BrowserQRCodeReader();

const source = 'https://my-image-or-video/01.png';
const resultImage = await codeReader.decodeFromImageUrl(source);
// or use decodeFromVideoUrl for videos
const resultVideo = await codeReader.decodeFromVideoUrl(source);
```

### Scan from video or image HTML element

```javascript
const codeReader = new ZXingBrowser.BrowserQRCodeReader();

const sourceElem = document.querySelector('#my-image-id');
const resultImage = await codeReader.decodeFromImageElement(sourceElem);
// or use decodeFromVideoElement for videos
const resultVideo = await codeReader.decodeFromVideoElement(sourceElem);
```

### Other scan methods

There's still other scan methods you can use for decoding barcodes in the browser with `BrowserCodeReader` family, all of those and previous listed in here:

- `decodeFromCanvas`
- `decodeFromImageElement`
- `decodeFromImageUrl`
- `decodeFromConstraints`
- `decodeFromStream`
- `decodeFromVideoDevice`
- `decodeFromVideoElement`
- `decodeFromVideoUrl`
- `decodeOnceFromConstraints`
- `decodeOnceFromStream`
- `decodeOnceFromVideoDevice`
- `decodeOnceFromVideoElement`
- `decodeOnceFromVideoUrl`

That's it for now.

### List of browser readers

- `BrowserAztecCodeReader`
- `BrowserCodeReader` (abstract, needs to be extend for use)
- `BrowserDatamatrixCodeReader`
- `BrowserMultiFormatOneDReader`
- `BrowserMultiFormatCodeReader` (2D + 1D)
- `BrowserPDF417CodeReader`
- `BrowserQRCodeCodeReader`

### Customize `BrowserCodeReader` options

You can also customize some options on the code reader at instantiation time. More docs comming soon.

---

[![Bless](https://cdn.rawgit.com/LunaGao/BlessYourCodeTag/master/tags/alpaca.svg)](http://lunagao.github.io/BlessYourCodeTag/)

[0]: https://www.npmjs.com/package/@zxing/browser
[1]: https://github.com/zxing/zxing
