const DEFAULT_W = 600;
const DEFAULT_H = 600;

const MODEL_PATH = '../model/';

let myCanvas;
let modelReady = false;
let textureReady = false;
let bgReady = false;
let myModel;
let xRot = 0;
let yRot = 0;
let zRot = 0;
let scaleF = 1;
let bgScaleF = 1;

let hueOffset = 0;
let flashOffset = 0;
let hueOffsetBg = 0;
let flashOffsetBg = 0;

let depthFg = 4;
let depthBg = 4;

let _3dGraph;
let _2dGraph;
let gifCapturer;
let gifHyperPeriod = -1;
let gifDuration = 0;
let gifStarted = false;
//let _gifGraph;

let image2D;
let finalImg;
let myTexture;
let bg;

let isAsciiOn, isDitherOn, isBWOn, isMatOn;
let isBgDitherOn, isBgBWOn;

let isMixerOn = false;

let glitchEffects = [];
let glitchFrames = 0;
let glitchScanDir, glitchScanX, glitchScanY;
let glitchDurInput, glitchSelect;
let isPreGlitchOn = true;
let glitchHoles = [];
let glitchWarpOffset = 0;
let glitchBurnThresh = [];


function onModelLoaded() {
    modelReady = true;
}

function onTextureLoaded() {
    textureReady = true;
}

function onBGLoaded() {
    bgReady = true;
    bg.hide();
    bg.volume(0);
    bg.loop();
}

function startGlitch() {
    glitchEffects.length = 0;
    glitchEffects = glitchSelect.selected();

    for (let i = 0; i < glitchEffects.length; i++) {
        if (glitchEffects[i] == 1) {
            glitchScanDir = random(1);
            glitchScanX = floor(random(DEFAULT_W / bgScaleF));
            glitchScanY = floor(random(DEFAULT_H / bgScaleF));
        } else if (glitchEffects[i] == 2) {
            glitchHoles.length = 0;
            let N = floor(random (5, 20)); //TODO: MAGIC NUMBER
    
            for (let i = 0; i < N; i++) {
                let srcX = floor(random(DEFAULT_W / bgScaleF));
                let srcY = floor(random(DEFAULT_H / bgScaleF));
                let srcW = floor(random(DEFAULT_W / bgScaleF));
                let srcH = floor(random(DEFAULT_H / bgScaleF));
                
                let dstX = floor(random(DEFAULT_W / bgScaleF));
                let dstY = floor(random(DEFAULT_H / bgScaleF));
                let dstW = floor(random(DEFAULT_W / bgScaleF));
                let dstH = floor(random(DEFAULT_H / bgScaleF));
    
                glitchHoles.push({ sx: srcX, sy: srcY , sw: srcW, sh: srcH,
                                   dx: dstX, dy: dstY , dw: dstW, dh: dstH});
            }
        } else if (glitchEffects[i] == 3) {
            glitchWarpOffset = floor(random(1, DEFAULT_W / 2 / bgScaleF));
        } else if (glitchEffects[i] == 4) {
            glitchBurnThresh = [random(COLOR_MAX), random(COLOR_MAX), random(COLOR_MAX)];
        }
    }

    //glitchType = glitchSelect.selected();
    let tempVal = parseInt(glitchDurInput.value());
    glitchFrames = ((tempVal !== NaN) && (tempVal > 0)) ? tempVal : 0;
    console.log("Triggered effects for frames: " +  glitchFrames);
}

function init_engine () {
    pixelDensity(1);
    myCanvas = createCanvas(DEFAULT_W, DEFAULT_H);

    _3dGraph = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);
    _2dGraph = createGraphics(DEFAULT_W, DEFAULT_H);
    //_gifGraph = createGraphics(DEFAULT_W, DEFAULT_H);


    gifCapturer = new CCapture( { format: 'gif', workersPath: 'lib/' } )

    initFonts(fontImage);
    initNoise();
}

function compute3D() {
    _3dGraph.reset();
    _3dGraph.background(0);
    _3dGraph.ambientLight(255, 255, 255, 255); 
    _3dGraph.directionalLight(255, 255, 255, 0, 0, -1);
    //_3dGraph.lights();
    //_3dGraph.pointLight(255, 255, 255, 100, 100, 100);

    _3dGraph.scale(3 / 800 * DEFAULT_W); // Scaled to make model fit into canvas
    _3dGraph.rotateX(PI);
    _3dGraph.rotateY(PI/2);
    _3dGraph.rotateX(frameCount * xRot);
    _3dGraph.rotateY(frameCount * yRot);
    _3dGraph.rotateZ(frameCount * zRot);

    if (textureReady === true) {
        _3dGraph.texture(myTexture);
        
    } else {
        _3dGraph.normalMaterial();
    }

    _3dGraph.model(myModel);

    return _3dGraph.get();
}

function compute2D() {
    _2dGraph.image(bg, 0, 0, DEFAULT_W, DEFAULT_H);
    return _2dGraph.get();
}

function startSavingGIF() {
    let xPeriod = (xRot != 0) ? floor(2 * PI / xRot) : 1;
    let yPeriod = (yRot != 0) ? floor(2 * PI / yRot) : 1;
    let zPeriod = (zRot != 0) ? floor(2 * PI / zRot) : 1;

    gifHyperPeriod = (gifDuration != 0) ? gifDuration : lcm3(xPeriod, yPeriod, zPeriod);
    //if (gifStarted == false) {
    //   gifStarted = true;
    //    gifCapturer.start();
    //}

    //console.log("Start saving gif, hyper period: " + hyperPeriod);
    saveGif('gifMatta', gifHyperPeriod, {  units: 'frames' });
}

function render() {
    background(0);
    let finalBg;
    let finalFg;

    if(bgReady) {
        let bgImage = compute2D();
        bgImage.resize(DEFAULT_W / bgScaleF, DEFAULT_H / bgScaleF);

        if ((isPreGlitchOn === true) && (glitchFrames > 0)) {
            for (let i = 0; i < glitchEffects.length; i++) {
                if (glitchEffects[i] == 1) {
                    GlitchScanner(bgImage,  glitchScanDir, glitchScanX, glitchScanY);
                } else if (glitchEffects[i] == 2) {
                    GlitchScramble(bgImage, glitchHoles, 1);
                } else if (glitchEffects[i] == 3) {
                    GlitchWarp(bgImage, glitchWarpOffset);
                } else if (glitchEffects[i]  == 4) {
                    GlitchPixelBurn(bgImage, glitchBurnThresh);
                }
            }
            glitchFrames--;
        }
      
        if(isBgBWOn) {
            bgImage.filter(GRAY); 
        } else if (((hueOffsetBg % 360) != 0) || (flashOffsetBg != 0) || (bgSatSlider.value() != 0)) {    
            ShiftHue(bgImage, hueOffsetBg, flashOffsetBg, bgSatSlider.value());
        }

        if (isBgDitherOn) {
            ditherIt(bgImage, isBgBWOn, depthBg); 
        }


        finalBg = upScale(bgImage, finalBg, bgScaleF, depthBg);

        if ((isPreGlitchOn === false) && (glitchFrames > 0)) {
            for (let i = 0; i < glitchEffects.length; i++) {
                if (glitchEffects[i] == 1) {
                    GlitchScanner(finalBg,  glitchScanDir, glitchScanX * bgScaleF, glitchScanY * bgScaleF);
                } else if (glitchEffects[i]  == 2) {
                    GlitchScramble(finalBg, glitchHoles, bgScaleF);
                } else if (glitchEffects[i]  == 3) {
                    GlitchWarp(finalBg, glitchWarpOffset * bgScaleF);
                } else if (glitchEffects[i]  == 4) {
                    GlitchPixelBurn(finalBg, glitchBurnThresh);
                }
            }

            glitchFrames--;
        }

        if (isMixerOn === false) {
            image(finalBg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    if (modelReady) {
        let image2D = compute3D();

        // Downscale the image
        image2D.resize(DEFAULT_W / scaleF, DEFAULT_H / scaleF);
        addAlpha(image2D);

        if(isBWOn) {
            image2D.filter(GRAY); 
        } else if (((hueOffset % 360) != 0) || (flashOffset != 0) || (fgSatSlider.value() != 0)) {  
            ShiftHue(image2D, hueOffset, flashOffset, fgSatSlider.value());
        }

        if (isDitherOn) {
            ditherIt(image2D, isBWOn, depthFg); 
        }

        // Upscale back the image
        finalFg = upScale(image2D, finalFg, scaleF, depthFg);

        if (isMixerOn === false) {
            image(finalFg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    if ((modelReady) && (bgReady) && (isMixerOn)) {
        let mixImage;
        mixImage = mixChannelsNoise(finalFg, finalBg, mixImage);
        image(mixImage, 0, 0, DEFAULT_W, DEFAULT_H);
    }

    /* Save the GIFs
    if (gifHyperPeriod > 0) {
        //let smallImg = get();
        //.resize(DEFAULT_W / 2, DEFAULT_H / 2);

        gifCapturer.capture(document.getElementById('defaultCanvas0'));
        gifHyperPeriod--;
    } else if (gifHyperPeriod == 0) {
        gifCapturer.stop();
        gifCapturer.save();
        gifHyperPeriod--;
    }
    */
}