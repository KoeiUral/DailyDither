
// TODO: move it in the graphic lib
const DitherType = {
    NONE: 0,
    STEIN: 1,
    BAYER: 2
  };




class Source {
    constructor() {
        this.glitchAlgo = DitherType.NONE;

        this.isBWOn = false;
        this.hueOffset = 0;
        this.hueInc = 0;
        this.hueFlash = 0;
        this.hueSaturation = 0;
        this.sampling = 1;

        this.ditherAlgo = 0;
        this.colDither = 4;
        this.dimDither = 2;

        this.isAsciiOn = false;
        this.isAsciiColor = false;

        this.glitcher = new Glitcher();

        this.graphCtx;
        this.img;
    }

    // Abstract function to update the graphic context and copy it into img
    update() {

    }

    // Abstract function to be implemented by inherited classes
    setSpecificProperties() {

    }

    setRandomProperties() {
        // Call specific properties
        this.setSpecificProperties();

        // Set the common properties to each source
        this.isBWOn = (random() < 0.2);
        this.hueOffset = floor(random(0, 100)) * (random() < 0.5);
        this.hueInc = floor(random(0, 15)) * (random() < 0.5);
        this.hueFlash = floor(random(0, 20)) * (random() < 0.5);;
        this.hueSaturation = floor(random()) * (random() < 0.5);
        this.sampling = 1 + floor(random(1, 4)) * (random() < 0.5);
        
        let ditherProb = random();
        this.ditherAlgo = (ditherProb > 0.33) ? DitherType.STEIN : 0;
        this.ditherAlgo = (ditherProb > 0.66) ? DitherType.BAYER : this.ditherAlgo;
        this.colDither = 4; // TODO: set random value
        this.dimDither = 2; // TODO: set random value

        this.isAsciiOn = (random() < 0.3);;
        this.isAsciiColor = (random() < 0.2);
        this.sampling = (this.isAsciiOn) ? 8 : this.sampling;

        // Glitcher
        this.glitcher.setImagScale(this.sampling);
        this.glitcher.isPreOn = (random() < 0.3);
        this.dynamicGlitch = (random() < 0.7);

        if (random() < 0.5) {
            this.glitcher.startSequence();
        }
    }

    // Applying enabled filters to the img
    render(mask, lowTh, highTh) {
        let retImage;

        if (this.img === undefined)
            return;

        // Sub sampling te image
        if (this.sampling > 1) {
            this.img.resize(DEFAULT_W / this.sampling, DEFAULT_H / this.sampling);
        }

        // Execute the glitch sequence
        this.glitcher.runSequence();

        // Apply glitches (if any) before processing
        if (this.glitcher.isPreOn === true) {
            this.glitcher.process(this.img);
        }

        // Apply color correction
        if (this.isBWOn) {
            this.img.filter(GRAY); 
        }  else if (((this.hueOffset % 360) != 0) || (this.hueInc != 0) || (this.hueFlash != 0) || (this.hueSaturation != 0)) {
            ShiftHue(this.img, (this.hueOffset + this.hueInc) % 360, this.hueFlash , this.hueSaturation);
        }

        // Apply dithering
        if (this.ditherAlgo == DitherType.STEIN) {
            ditherIt(this.img, this.isBWOn, COLOR_DEPTH); 
        } else if (this.ditherAlgo == DitherType.BAYER) {
            BayerDithering(this.img, this.colDither, this.dimDither);
        }

        // Add Alpha Ch as per mixer inputs
        addAlphaMask(this.img, this.sampling, mask, lowTh, highTh);

        // Apply ASCII convertion      
        if ((this.isAsciiOn) && (fontReady)) {
            retImage = asciifyIt(this.img, this.sampling, myFont, this.isAsciiColor);
        } else if (this.sampling > 1) { // Upscale back the image
            retImage = upScale(this.img, retImage, this.sampling);
        } else {
            retImage = this.img.get(); 
        }

        // Apply glitches (if any) after processing
        if (this.glitcher.isPreOn === false) {
            this.glitcher.process(retImage);
        }

        return retImage;
    }
}


class DummySource extends Source {
    constructor() {
        super();
        this.r = 0;
        this.g = 0;
        this.b = 0;

        this.graphCtx = createGraphics(DEFAULT_W, DEFAULT_H);
    }

    setBg(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    update() {
        this.graphCtx.background(this.r, this.g, this.b);
        this.img = this.graphCtx.get();
    }
}




