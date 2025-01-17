/*const FREQ = [1, 2, 4, 8, 16, 32];
const AMP = [1, 1/2, 1/3, 1/4, 1/5, 1/6];
const AMP_SUM = AMP[0] + AMP[1] + AMP[2] + AMP[3] + AMP[4] + AMP[5];

const TIME_INC = 0.01;
const SIN_K = 2;
const EXP = 2;
const DIST = 0.4;
*/



const SourceType = {
    DUMMY: 1,
    THREE_D: 2,
    TWO_D: 3,
    AUTOMA: 4
  };


class Mixer {
    constructor() {
        this.sourceList = [];
        this.noiseMask = [];
        this.maxScale = 0;

        /* Noise generator parameters */
        this.freqs = [1, 2, 4, 8, 16, 32];
        this.amps =  [1, 1/2, 1/3, 1/4, 1/5, 1/6];
        this.ampSum = 0;
        this.sinK = 2;
        this.expK = 1.3;

        for (let amp of this.amps) {
            this.ampSum += amp;
        }

        this.timeInc = 0.008 ;//0.1;
        this.spaceInc = 0.05;
        this.zOff = 0;
        this.dsx = 0;
        this.dsy = 0;
        this.noiseVel = createVector(random(-1,1), random(-1,1));
    }

    addSource(type, size) {
        let newSource;

        if (type === SourceType.DUMMY) {
            newSource = new DummySource();
            newSource.setBg(floor(random(255)), floor(random(255)), floor(random(255)));
        } else if (type === SourceType.AUTOMA) {
            //let index = floor(random(SIZE_LIST.length));
            //let cellSize = (size != undefined) ? size : SIZE_LIST[index];
            
            newSource = new SourceAutoma(0, COLOR_NBR, RULE_VAL);
            newSource.setRandomProperties();

            newSource.sampling = newSource.currentSize;
            newSource.startRandomRule();
        } else if (type === SourceType.THREE_D) {
            newSource = new Source3D();
            newSource.setRandomProperties();
            //newSource.loadModel("bulldog.obj");
        } else if (type === SourceType.TWO_D) {
            newSource = new Source2D();
            newSource.setRandomProperties();
            //newSource.loadModel("SampleVideo_1280x720_2mb.mp4");
        }

        this.sourceList.push(newSource);
    }

    removeSource(id) {

    }

    computeNoiseMask() {
        let nx, ny;
        let e = 0;
        let d = 0;
        let xOff = 0;
        let yOff = 0;
        let maskWidth;
        let maskHeight;

        // Get the maximum scaleFactor
        this.maxScale = this.sourceList[0].sampling;
        for (let i = 1; i < this.sourceList.length; i++) {
            max(this.maxScale, this.sourceList[i].sampling)
        }

        // Cap the maximum scaling to 10
        this.maxScale = (this.maxScale > 10) ? 10 : this.maxScale;

        // Get the width and height of the noise mask
        maskWidth = floor(DEFAULT_W / this.maxScale);
        maskHeight = floor(DEFAULT_H / this.maxScale);

        // Clear the mask
        this.noiseMask.length = 0;

        // Compute the harmonic noise for each mask pixel coord
        for (let y = 0; y < maskHeight; y++) {
            this.noiseMask[y] = [];
            xOff = 0;
            for (let x = 0; x < maskWidth; x++) {
                nx = xOff;//x / maskWidth;// - 0.5;
                ny = yOff;//y / maskHeight;// - 0.5;
                d = 1 - (1 - nx * nx) * (1 - ny * ny);
                e = 0;

                for (let j = 0; j < this.freqs.length; j++) {
                    //e += this.amps[j] * (noiseGen.noise3D(nx * this.freqs[j], ny * this.freqs[j], /*sin(this.sinK  * this.zOff)) / 2 + 0.5);
                    e += this.amps[j] * (noiseGen.noise3D(nx * this.freqs[j] + this.dsx, ny * this.freqs[j] + this.dsy, this.zOff) / 2 + 0.5);
                }

                e = e / this.ampSum;
                e = Math.pow(e, this.expK);
                //e = (1 - DIST) * e + DIST * (1 - d);  //equal to -> e = lerp (e, 1 - d, DIST);

                this.noiseMask[y][x] = e;
                xOff += this.timeInc;
            }
            yOff += this.timeInc;
        }

        // Increment the Z-axis variable (i.e. time)
        this.zOff += this.timeInc;
        this.dsx +=  this.spaceInc * this.noiseVel.normalize().x;
        this.dsy +=  this.spaceInc * this.noiseVel.normalize().y;
    }

    computeSplitMask() {
        let maskWidth;
        let maskHeight;
        let delta;
        let maskValues = [];

        // Get the maximum scaleFactor and Init the mask values (from 0 to 1)
        this.maxScale = this.sourceList[0].sampling;
        for (let i = 1; i < this.sourceList.length; i++) {
            max(this.maxScale, this.sourceList[i].sampling);
        }

        // Cap the maximum scaling to 10
        this.maxScale = (this.maxScale > 10) ? 10 : this.maxScale;

        // Init the mask values (from 0 to 1)
        for (let i = 0; i < this.sourceList.length; i++) {
            maskValues.push(i / this.sourceList.length);
        }

        // Get the width and height of the noise mask
        maskWidth = floor(DEFAULT_W / this.maxScale);
        maskHeight = floor(DEFAULT_H / this.maxScale);
        delta = maskWidth / this.sourceList.length;

        for (let y = 0; y < maskHeight; y++) {
            this.noiseMask[y] = [];
            for (let x = 0; x < maskWidth; x++) {
                this.noiseMask[y][x] = maskValues[floor(y / delta)];
            }
        }
    }

    compose() {
        for (let src of this.sourceList) {
            src.update();
        }
    }

    render() {
        let minVal, maxVal;
        let delta = 1.0 / (this.sourceList.length);// + 2);
        let tempImg;

        // Compute noise mask for source mixing
        this.computeNoiseMask();

        // Iterate over all the sources
        for (let i = 0; i < this.sourceList.length; i++) {
            minVal = delta * (i + 0);
            maxVal = delta * (i + 1);

            // Generate image for current source
            tempImg = this.sourceList[i].render(this.noiseMask, minVal, maxVal);

            // Display temp image on canvas
            if (tempImg !== undefined)
                image(tempImg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    /*
    testMask() {
        this.sourceList.push(new Source());
        this.sourceList[0].sampling = 30;
        console.log("pizza");

        this.computeNoiseMask();

        console.log("Mask: %o", this.noiseMask);
    }
    */

    addRandomSources() {
        let sourceNbr = round(random(1, 4));

        for (let i = 0; i < sourceNbr; i++) {
            let typeProb = random();
            let currentType;

            if (typeProb < 0.5) {
                currentType = SourceType.AUTOMA;
            } else if (typeProb < 0.8) {
                currentType = SourceType.TWO_D;
            } else {
                currentType = SourceType.THREE_D;
            }

            this.addSource(currentType);
            console.log("ADDED " + currentType);
        }
    }

    setTestProp () {
        this.addRandomSources();
        //this.addSource(SourceType.AUTOMA, 10);
        //this.addSource(SourceType.AUTOMA, 8);
        //this.addSource(SourceType.AUTOMA, 20);
        //this.addSource(SourceType.DUMMY);
        //this.addSource(SourceType.AUTOMA);
        //this.addSource(SourceType.AUTOMA);
        //myMixer.addSource(SourceType.DUMMY);
        //myMixer.addSource(SourceType.DUMMY);
        //myMixer.addSource(SourceType.DUMMY);
        
        //this.addSource(SourceType.THREE_D);
        //this.addSource(SourceType.THREE_D);
        //this.addSource(SourceType.TWO_D);

        //this.sourceList[0].yRot = 0.1;

        //this.sourceList[0].setBg(255, 0, 0);
        //this.sourceList[1].setBg(0, 255, 0);
        //this.sourceList[2].setBg(0, 0, 255);

        //this.sourceList[0].sampling = 5;
        //this.sourceList[1].sampling = 1;
        //this.sourceList[2].sampling = 1;

        //this.sourceList[0].setRandomProperties();
        //this.sourceList[1].setRandomProperties();

        //this.sourceList[0].hueFlash = 0;
        //this.sourceList[0].loadPalette('color5.json');
        //this.sourceList[0].addTransaltionTarget(400, 400, -500);
        //this.sourceList[0].addTransaltionTarget(10, 200, -500);
        //this.sourceList[0].addTransaltionTarget(10, 400, -500);
        //this.sourceList[0].ditherAlgo = DitherType.BAYER;
        //this.sourceList[0].ditherAlgo = DitherType.STEIN;
        //this.sourceList[0].isAsciiOn = false;
        //this.sourceList[0].isAsciiColor = false;

        //this.sourceList[0].glitcher.setImagScale(this.sourceList[0].sampling);
        //this.sourceList[1].glitcher.setImagScale(this.sourceList[1].sampling);
        //this.sourceList[2].glitcher.setImagScale(this.sourceList[2].sampling);

        //this.sourceList[0].glitcher.startSequence();
        //this.sourceList[2].glitcher.startSequence();
        //this.sourceList[0].glitcher.isPreOn = true;  /// TODO: INVESTIGATE why pre is not working, suspect scale problem
        //this.sourceList[0].glitcher.dynamicGlitch = false;
        //this.sourceList[0].glitcher.addEffect(1, 10000);
        //this.sourceList[0].glitcher.addEffect(5, 10000);
        //this.sourceList[0].glitcher.addEffect(3, 10000);


        //this.sourceList[0].loadPalette('color2.json');
        //this.computeSplitMask();

        //this.sourceList[2].isAsciiOn = true;
        //this.sourceList[3].hueSaturation = 100;
    }
}