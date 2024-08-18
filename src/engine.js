const DEFAULT_W = 600;
const DEFAULT_H = 600;

const MODEL_PATH = './model/';
const IMAGE_PATH = './image/';
const VIDEO_PATH = './video/';

let myCanvas;
let modelReady = false;
let textureReady = false;
let myTexIsVideo = false;
let bgReady = false;
let myModel;
let xRot = 0;
let yRot = 0;
let zRot = 0;

const MAX_TARGETS = 3;
let targets = [];
let targetsInUse = [];
let targetUsed = 0;
let currentPos;
let targetIndex = 0;
let targetSpeed = 0.1;

let scaleF = 1;
let bgScaleF = 1;

let hueOffset = 0;
let hueInc = 0;
let flashOffset = 0;
let satLevelFg = 0;
let hueOffsetBg = 0;
let hueIncBg = 0;
let flashOffsetBg = 0;
let satLevelBg = 0;

let depthFg = 4;
let depthBg = 4;

let _3dGraph;
let _2dGraph;
let webmPeriod = -1;
let recDuration = 0;
let webmCapturer;
let webmStarted = false;
//let _gifGraph;

let image2D;
let finalImg;
let myTexture;
let bg;
let myBgIsVideo = false;

let isAsciiOn, isDitherOn, isBWOn, isMatOn;
let isBgDitherOn, isBgBWOn;
let isMixerOn = false;

let fgGlitchEffects = [];
let fgGlitchFrames = 0;
let fgGlitchScanDir, fgGlitchScanX, fgGlitchScanY;
let fgGlitchDurInput, fgGlitchSelect;  // TODO: remove GUI dependency
let isPreGlitchOnFg = true;
let fgGlitchHoles = [];
let fgGlitchWarpOffset = 0;
let fgGlitchBurnThresh = [];

const GlitchSeqState = {
    IDLE: 'IDLE',
    ON: 'ON',
    WAIT: 'WAIT'
  };

const STEP_WAIT_TIME = 10;
const MAX_SEQ_STEP = 10;
const MIN_STEP_TIME = 7;
const MAX_STEP_TIME = 35;

let glitchCurrentState = GlitchSeqState.IDLE;
let glitchCurrentStep = 0;
let nextGlitchFrames = 0;
let glitchWaitTime = 0;
let glitchSequence = [];

let glitchEffects = [];
let glitchFrames = 0;
let glitchScanDir, glitchScanX, glitchScanY;
let glitchDurInput, glitchSelect; // TODO: remove GUI dependency
let isPreGlitchOn = true;
let glitchHoles = [];
let glitchWarpOffset = 0;
let glitchBurnThresh = [];


function onModelLoaded() {
    modelReady = true;
}

function onTextureLoaded() {
    textureReady = true;

    if (myTexIsVideo) {
        myTexture.hide();
        myTexture.loop();
    }
}

function onBGLoaded() {
    bgReady = true;

    if (myBgIsVideo) {
        bg.hide();
        bg.volume(0);
        bg.loop();
    }
}

function startGlitch() {
    glitchEffects.length = 0;
    glitchEffects = glitchSelect.selected();  // TODO REMOVE DEP

    let tempVal = configureGlitchParams(glitchEffects);

    /* Override the random glitch duration iwth the user defined one */
    tempVal = parseInt(glitchDurInput.value()); // TODO: Remove GIU DEPENDENCY
    glitchFrames = ((tempVal !== NaN) && (tempVal > 0)) ? tempVal : 0;
}

function startFgGlitch() {
    fgGlitchEffects.length = 0;
    fgGlitchEffects = fgGlitchSelect.selected(); // TODO REMOVE DEP

    for (let i = 0; i < fgGlitchEffects.length; i++) {
        if (fgGlitchEffects[i] == 1) {
            fgGlitchScanDir = random(1);
            fgGlitchScanX = floor(random(DEFAULT_W / scaleF));
            fgGlitchScanY = floor(random(DEFAULT_H / scaleF));
        } else if (fgGlitchEffects[i] == 2) {
            fgGlitchHoles.length = 0;
            let N = floor(random (5, 20)); //TODO: MAGIC NUMBER
    
            for (let i = 0; i < N; i++) {
                let srcX = floor(random(DEFAULT_W / scaleF));
                let srcY = floor(random(DEFAULT_H / scaleF));
                let srcW = floor(random(DEFAULT_W / scaleF));
                let srcH = floor(random(DEFAULT_H / scaleF));
                
                let dstX = floor(random(DEFAULT_W / scaleF));
                let dstY = floor(random(DEFAULT_H / scaleF));
                let dstW = floor(random(DEFAULT_W / scaleF));
                let dstH = floor(random(DEFAULT_H / scaleF));
    
                fgGlitchHoles.push({ sx: srcX, sy: srcY , sw: srcW, sh: srcH,
                                     dx: dstX, dy: dstY , dw: dstW, dh: dstH});
            }
        } else if (fgGlitchEffects[i] == 3) {
            fgGlitchWarpOffset = floor(random(1, DEFAULT_W / 2 / scaleF));
        } else if (fgGlitchEffects[i] == 4) {
            fgGlitchBurnThresh = [random(COLOR_MAX), random(COLOR_MAX), random(COLOR_MAX)];
        }
    }

    tempVal = parseInt(fgGlitchDurInput.value()); // TODO: Remove GIU DEPENDENCY
    fgGlitchFrames = ((tempVal !== NaN) && (tempVal > 0)) ? tempVal : 0;
}


function initTargets () {

    for (let i = 0; i < MAX_TARGETS; i++) {
        targets.push(createVector(0, 0, 0));
        targetsInUse.push(false);
    }

    currentPos = createVector(0, 0, 0);
}

function updateTranslationTargets(coordId, value) {
    let pointId = parseInt(coordId / 3);

    if ((coordId % 3) === 0) {
        targets[pointId].x = value - DEFAULT_W / 2;
    } else if ((coordId % 3) === 1) {
        targets[pointId].y = value - DEFAULT_H / 2;//DEFAULT_H / 2 - value;
    } else {
        targets[pointId].z = value
    }
}

function addTransaltionTarget(xPoint, yPoint, zPoint) {
    targets.push(createVector(xPoint - DEFAULT_W / 2, yPoint - DEFAULT_H / 2, zPoint));
    targetsInUse.push(true);
    targetUsed++;
}

function clearTransalationTargets() {
    targets.length = 0;
    targetsInUse.length = 0;
    targetUsed = 0;
    targetIndex = 0;
}

function checkTargetChange() {

    let diff = p5.Vector.sub(currentPos, targets[targetIndex]);
    if (diff.mag() < 5) {
        /* Move to the next target in use within the array */
        do {
            targetIndex = (targetIndex + 1) % targets.length;
        } while (targetsInUse[targetIndex] == false);       
    }
}

function compute3D() {
    _3dGraph.reset();
    _3dGraph.background(0);
    _3dGraph.ambientLight(255, 255, 255, 255); 
    _3dGraph.directionalLight(255, 255, 255, 0, 0, -1);

    _3dGraph.scale(3 / 800 * DEFAULT_W); // Scaled to make model fit into canvas ???

    /* Apply translation */
    if (targetUsed > 1) {
        currentPos = p5.Vector.lerp(currentPos, targets[targetIndex], targetSpeed);
        _3dGraph.translate(currentPos);
        checkTargetChange();
    }

    /* Apply default (?) + custom rotation */
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

    let gifHyperPeriod = (recDuration != 0) ? recDuration : lcm3(xPeriod, yPeriod, zPeriod);

    //console.log("Start saving gif, hyper period: " + hyperPeriod);
    saveGif('gifMatta', gifHyperPeriod, {  units: 'frames' });
}

function startSavingWEBM() {
    let xPeriod = (xRot != 0) ? floor(2 * PI / xRot) : 1;
    let yPeriod = (yRot != 0) ? floor(2 * PI / yRot) : 1;
    let zPeriod = (zRot != 0) ? floor(2 * PI / zRot) : 1;

    webmPeriod = (recDuration != 0) ? recDuration : lcm3(xPeriod, yPeriod, zPeriod);

    if (webmStarted == false) {
        webmStarted = true;
        webmCapturer.start();
    }
}

function glitchBg(image) {
    if (glitchFrames > 0) {
        for (let i = 0; i < glitchEffects.length; i++) {
            if (glitchEffects[i] == 1) {
                GlitchScanner(image,  glitchScanDir, glitchScanX, glitchScanY);
            } else if (glitchEffects[i] == 2) {
                GlitchScramble(image, glitchHoles, 1);
            } else if (glitchEffects[i] == 3) {
                GlitchWarp(image, glitchWarpOffset);
            } else if (glitchEffects[i]  == 4) {
                GlitchPixelBurn(image, glitchBurnThresh);
            }
        }
        glitchFrames--;
    }
}

function glitchFg(image) {
    if (fgGlitchFrames > 0) {
        for (let i = 0; i < fgGlitchEffects.length; i++) {
            if (fgGlitchEffects[i] == 1) {
                GlitchScanner(image,  fgGlitchScanDir, fgGlitchScanX * scaleF, fgGlitchScanY * scaleF);
            } else if (fgGlitchEffects[i]  == 2) {
                GlitchScramble(image, fgGlitchHoles, scaleF);
            } else if (fgGlitchEffects[i]  == 3) {
                GlitchWarp(image, fgGlitchWarpOffset * scaleF);
            } else if (fgGlitchEffects[i]  == 4) {
                GlitchPixelBurn(image, fgGlitchBurnThresh);
            }
        }

        fgGlitchFrames--;
    }
}

function configureGlitchParams(glitchList) {
    for (let i = 0; i < glitchList.length; i++) {
        if (glitchList[i] == 1) {
            glitchScanDir = random(1);
            glitchScanX = floor(random(DEFAULT_W / bgScaleF));
            glitchScanY = floor(random(DEFAULT_H / bgScaleF));
        } else if (glitchList[i] == 2) {
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
        } else if (glitchList[i] == 3) {
            glitchWarpOffset = floor(random(1, DEFAULT_W / 2 / bgScaleF));
        } else if (glitchList[i] == 4) {
            glitchBurnThresh = [random(COLOR_MAX), random(COLOR_MAX), random(COLOR_MAX)];
        }
    }

    let sequenceTime = parseInt(random(MIN_STEP_TIME, MAX_STEP_TIME));
    return sequenceTime;
}

function createGlitchSequence() {
    let stepNbr = parseInt(random(2, MAX_SEQ_STEP));
    const MAX_GLITCH = 4;

    /* Clear the list of selcetd glitches */
    glitchSequence.length = 0;

    for (let i = 0; i < stepNbr; i++) {
        /* Create the list of possible values [1,2,3,4] */
        let effectValues = [];
        for (let i = 1; i <= MAX_GLITCH; i++) {
            effectValues.push(i); 
        }

        glitchEffectNbr = parseInt(random(1, MAX_GLITCH));
        let randomSeq = [];

        /* Get the array of unique glitchEffectNbr numbers with value between 1 and MAX_GLITCH 
         * e.g. glitchNumber = 3 -> sequence is [1, 3, 4]
         * algo taken from: https://dev.to/sagdish/generate-unique-non-repeating-random-numbers-g6g
         */
        for (let j = 1; j <= glitchEffectNbr; j++) {
          const randomId = Math.floor(Math.random() * (MAX_GLITCH - j));
          randomSeq.push(effectValues[randomId]);

          effectValues[randomId] = effectValues[MAX_GLITCH - j];
        }

        glitchSequence.push(randomSeq);
    }

    //console.log(glitchSequence);
    glitchCurrentState = GlitchSeqState.ON;
}

function checkGlitchAutomaticSeq() {

    if ((glitchCurrentState === GlitchSeqState.ON) && (glitchFrames === 0)) {
        // Get next step in the sequence
        if (glitchCurrentStep < glitchSequence.length) {
            // Set new effect and store glitchframes somewhere:
            glitchEffects = glitchSequence[glitchCurrentStep].slice();
            nextGlitchFrames = configureGlitchParams(glitchEffects);
            glitchWaitTime = (glitchCurrentStep === 0) ? 0 : STEP_WAIT_TIME;
            glitchCurrentState = GlitchSeqState.WAIT;
            glitchCurrentStep++;
        } else { // if end of seq
            // Reset all and set SeqState to IDLE
            glitchCurrentStep = 0;
            glitchFrames = 0;
            nextGlitchFrames = 0;
            glitchWaitTime = 0;
            glitchCurrentState = GlitchSeqState.IDLE;
        }  
    } // else glitch is running
    
    if (glitchCurrentState === GlitchSeqState.WAIT) {
        if (glitchWaitTime > 0) {
            glitchWaitTime--;
        } else {
            glitchCurrentState = GlitchSeqState.ON;
            glitchFrames = nextGlitchFrames;
        }
    }
}

function getFiles(path) {
    let files = [];
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false); // false for synchronous request
    xmlHttp.send(null);

    let ret = xmlHttp.responseText;
    let contentList = ret.split('\n');

    for (let i = 0; i < contentList.length; i++) {
        const rx = /href=\"(.*)\"\sclass/;
        let found = rx.exec(contentList[i]);

        if ((found !== null) && (found[1] !== "/")) {
            files.push(found[1]);
        }
    }

    return files;
}


function init_engine () {
    pixelDensity(1);
    myCanvas = createCanvas(DEFAULT_W, DEFAULT_H);

    _3dGraph = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);
    _2dGraph = createGraphics(DEFAULT_W, DEFAULT_H);
    //_gifGraph = createGraphics(DEFAULT_W, DEFAULT_H);
    webmCapturer = new CCapture( { format: 'webm', display: true } );

    initFonts(fontImage);
    initNoise();
    initTargets();
}

function render() {
    background(0);
    let finalBg;
    let finalFg;

    if(bgReady) {
        let bgImage = compute2D();

        checkGlitchAutomaticSeq();

        if (isPreGlitchOn === true) {
            glitchBg(bgImage);
        }

        bgImage.resize(DEFAULT_W / bgScaleF, DEFAULT_H / bgScaleF);

        if(isBgBWOn) {
            bgImage.filter(GRAY); 
        } else if (((hueOffsetBg % 360) != 0) || (hueIncBg != 0) || (flashOffsetBg != 0) || (satLevelBg != 0)) {
            hueOffsetBg = (hueOffsetBg + hueIncBg) % 360;     
            ShiftHue(bgImage, hueOffsetBg, flashOffsetBg, satLevelBg);
        }

        if (isBgDitherOn) {
            ditherIt(bgImage, isBgBWOn, depthBg); 
        }

        finalBg = upScale(bgImage, finalBg, bgScaleF, depthBg);

        if (isPreGlitchOn === false) {
            glitchBg(finalBg);
        }

        if (isMixerOn === false) {
            image(finalBg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    if (modelReady) {
        let image2D = compute3D();

        if (isPreGlitchOnFg === true) {
            glitchFg(image2D);
        }

        // Downscale the image
        image2D.resize(DEFAULT_W / scaleF, DEFAULT_H / scaleF);
        addAlpha(image2D);

        if(isBWOn) {
            image2D.filter(GRAY); 
        } else if (((hueOffset % 360) != 0) || (hueInc != 0) || (flashOffset != 0) || (satLevelFg != 0)) {
            hueOffset = (hueOffset + hueInc) % 360;  
            ShiftHue(image2D, hueOffset, flashOffset, satLevelFg);
        }

        if (isDitherOn) {
            ditherIt(image2D, isBWOn, depthFg); 
        }

        // Upscale back the image
        finalFg = upScale(image2D, finalFg, scaleF, depthFg);

        if (isPreGlitchOnFg === false) {
            glitchFg(finalFg);
        }

        if (isMixerOn === false) {
            image(finalFg, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    if ((modelReady) && (bgReady) && (isMixerOn)) {
        let mixImage;
        mixImage = mixChannelsNoise(finalFg, finalBg, mixImage);
        image(mixImage, 0, 0, DEFAULT_W, DEFAULT_H);
    }

    /* Save the WEBM  */
    if (webmPeriod > 0) {
        //let smallImg = get();
        //.resize(DEFAULT_W / 2, DEFAULT_H / 2);

        webmCapturer.capture(document.getElementById('defaultCanvas0'));
        webmPeriod--;
    } else if (webmPeriod == 0) {
        webmCapturer.stop();
        webmCapturer.save();
        webmPeriod--;
    }

}