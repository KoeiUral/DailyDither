



class Source {
    constructor() {
        this.ditherAlgo = 0;
        this.glitchAlgo = 0;
        this.isBWOn = false;
        this.isAsciiOn = false;
        this.sampling = 1;

        this.graphCtx;
        this.img = new createImage(DEFAULT_W, DEFAULT_H);
    }

    // Abstract function to update the graphic context and copy it in img
    update() {

    }

    // Applying enabled filters to the img
    render() {
        let retImage;

        if (this.sampling > 1) {
            this.img.resize(DEFAULT_W / this.sampling, DEFAULT_H / this.sampling);
        }

        if(this.isBWOn) {
            this.img.filter(GRAY); 
        }

        if (this.ditherAlgo != 0) {
            ditherIt(this.img, this.ditherAlg); 
        }
        else if (this.isAsciiOn) {
            asciify(this.img);
        }

        // Upscale back the image
        if (this.sampling > 1) {
            /// maybe make sense to create the retImage here, outside the function.
            retImage = upScale(this.img, retImage, this.sampling);
        } else {
            retImage = this.img.get(); 
        }

        return retImage;
    }


}