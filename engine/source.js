// TODO: move it in the graphic lib
const DitherType = {
    NONE: 0,
    STEIN: 1,
    BAYER: 2
  };

const BW_P = 0.2;
const HUE_OFF_P = 0.5;
const HUE_INC_P = 0.5;
const HUE_FLASH_P = 0.5;
const HUE_SAT_P = 0.5;
const SAMPLE_P = 0.8;
const DIT_STEIN_P = 0.33;
const DIT_BAY_P = 0.66;
const ASCII_P = 0.3;
const ASCII_COL_P = 0.2;
const GLI_PRE_P = 0.3;
const GLI_DYN_P = 0.7;
const GLI_ON_P = 0.6;

const HUE_OFF_MAX = 100;
const HUE_INC_MAX = 15;
const HUE_FLASH_MAX = 20;
const SAMPLING_MAX = 10;

class Source {
    constructor() {
        this.type = 0;
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

    setRandomProperties(type) {
        this.type = type;
        // Call specific properties
        this.setSpecificProperties();

        // Set the common properties to each source
        this.isBWOn = (random() < BW_P);
        this.hueOffset = floor(random(0, HUE_OFF_MAX)) * (random() < HUE_OFF_P);
        this.hueInc = floor(random(0, HUE_INC_MAX)) * (random() < HUE_INC_P);
        this.hueFlash = floor(random(0, HUE_FLASH_MAX)) * (random() < HUE_FLASH_P);
        this.hueSaturation = floor(random()) * (random() < HUE_SAT_P);
        this.sampling = ceil(random(1, SAMPLING_MAX)) * (random() < SAMPLE_P);
        
        let ditherProb = random();
        this.ditherAlgo = (ditherProb > DIT_STEIN_P) ? DitherType.STEIN : 0;
        this.ditherAlgo = (ditherProb > DIT_BAY_P) ? DitherType.BAYER : this.ditherAlgo;
        this.colDither = 4; // TODO: set random value
        this.dimDither = 2; // TODO: set random value

        this.isAsciiOn = (random() < ASCII_P);;
        this.isAsciiColor = (random() < ASCII_COL_P);
        this.sampling = ((this.isAsciiOn) && (this.sampling < 8)) ? 8 : this.sampling;

        // Glitcher
        this.glitcher.setImagScale(this.sampling);
        this.glitcher.isPreOn = (random() < GLI_PRE_P);
        this.dynamicGlitch = (random() < GLI_DYN_P);

        if (random() < GLI_ON_P) {
           this.glitcher.startSequence();
        }

        console.log("\tsampling: %d, glitchScale: %d, preGlitch: %d", this.sampling, this.glitcher.imageScale, this.glitcher.isPreOn);
        console.log("\tascii: %d, dither: %s", this.isAsciiOn, this.ditherAlgo);
        console.log("\thue offset: %d, hue inc: %d, hue flash: %d,  hue sat: %d", this.hueOffset, this.hueInc, this.hueFlash, this.hueSaturation);
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
        this.setBg(floor(random(255)), floor(random(255)), floor(random(255)));
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




