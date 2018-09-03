import {
    EncodeHintType,
    IllegalArgumentException,
    IllegalStateException,
    QRCodeDecoderErrorCorrectionLevel,
    QRCodeEncoder,
    QRCodeEncoderQRCode,
} from '@zxing/library';

export class BrowserQRCodeSvgWriter {

    private static readonly QUIET_ZONE_SIZE = 4;

    /**
     * SVG markup NameSpace
     */
    private static readonly SVG_NS = 'http://www.w3.org/2000/svg';

    /**
     * Constructs. 😉
     */
    public constructor(
        /**
         * A HTML container element for the image.
         */
        readonly containerElement: HTMLElement,
    ) { }

    public write(
        contents: string,
        width: number,
        height: number,
        hints: Map<EncodeHintType, any>,
    ): SVGSVGElement {

        if (contents.length === 0) {
            throw new IllegalArgumentException('Found empty contents');
        }

        // if (format != BarcodeFormat.QR_CODE) {
        //   throw new IllegalArgumentException("Can only encode QR_CODE, but got " + format)
        // }

        if (width < 0 || height < 0) {
            throw new IllegalArgumentException('Requested dimensions are too small: ' + width + 'x' + height);
        }

        let errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.L;
        let quietZone = BrowserQRCodeSvgWriter.QUIET_ZONE_SIZE;

        if (hints !== null) {

            if (hints.get(EncodeHintType.ERROR_CORRECTION)) {
                const stringHints = hints.get(EncodeHintType.ERROR_CORRECTION).toString();
                errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.fromString(stringHints);
            }

            if (hints.get(EncodeHintType.MARGIN)) {
                quietZone = parseInt(hints.get(EncodeHintType.MARGIN).toString(), 10);
            }
        }

        const code = QRCodeEncoder.encode(contents, errorCorrectionLevel, hints);

        return this.renderResult(code, width, height, quietZone);
    }

    /**
     * Note that the input matrix uses 0 == white, 1 == black.
     * The output matrix uses 0 == black, 255 == white (i.e. an 8 bit greyscale bitmap).
     */
    private renderResult(
        code: QRCodeEncoderQRCode,
        width: number,
        height: number,
        quietZone: number,
    ): SVGSVGElement {

        const input = code.getMatrix();

        if (input === null) {
            throw new IllegalStateException();
        }

        const inputWidth = input.getWidth();
        const inputHeight = input.getHeight();
        const qrWidth = inputWidth + (quietZone * 2);
        const qrHeight = inputHeight + (quietZone * 2);
        const outputWidth = Math.max(width, qrWidth);
        const outputHeight = Math.max(height, qrHeight);

        const multiple = Math.min(Math.floor(outputWidth / qrWidth), Math.floor(outputHeight / qrHeight));

        // Padding includes both the quiet zone and the extra white pixels to accommodate the requested
        // dimensions. For example, if input is 25x25 the QR will be 33x33 including the quiet zone.
        // If the requested size is 200x160, the multiple will be 4, for a QR of 132x132. These will
        // handle all the padding from 100x100 (the actual QR) up to 200x160.
        const leftPadding = Math.floor((outputWidth - (inputWidth * multiple)) / 2);
        const topPadding = Math.floor((outputHeight - (inputHeight * multiple)) / 2);

        const svgElement = this.createSVGElement(outputWidth, outputHeight);

        this.containerElement.appendChild(svgElement);

        for (let inputY = 0, outputY = topPadding; inputY < inputHeight; inputY++ , outputY += multiple) {
            // Write the contents of this row of the barcode
            for (let inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++ , outputX += multiple) {
                if (input.get(inputX, inputY) === 1) {
                    const svgRectElement = this.createSvgRectElement(outputX, outputY, multiple, multiple);
                    svgElement.appendChild(svgRectElement);
                }
            }
        }

        return svgElement;
    }

    private createSVGElement(w: number, h: number): SVGSVGElement {

        const svgElement = document.createElementNS(BrowserQRCodeSvgWriter.SVG_NS, 'svg');

        svgElement.setAttributeNS('', 'height', w.toString());
        svgElement.setAttributeNS('', 'width', h.toString());

        return svgElement;
    }

    private createSvgRectElement(x: number, y: number, w: number, h: number): SVGRectElement {

        const rect = document.createElementNS(BrowserQRCodeSvgWriter.SVG_NS, 'rect');

        rect.setAttributeNS('', 'x', x.toString());
        rect.setAttributeNS('', 'y', y.toString());
        rect.setAttributeNS('', 'height', w.toString());
        rect.setAttributeNS('', 'width', h.toString());
        rect.setAttributeNS('', 'fill', '#000000');

        return rect;
    }
}
