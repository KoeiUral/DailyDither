const DEFAULT_W = 600;
const DEFAULT_H = 600;

const MODEL_PATH = '../model/';

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

let image2D;
let finalImg;
let myTexture;
let bg;



let isAsciiOn, isDitherOn, isBWOn, isMatOn;
let isBgDitherOn, isBgBWOn;
let isSaturationMax = false;
let isMixerOn = false;

let glitchEffects = [];
let glitchFrames = 0;
let glitchScanDir, glitchScanX, glitchScanY;
let glitchDurInput, glitchSelect;
let isPreGlitchOn = true;
let glitchHoles = [];
let glitchWarpOffset = 0;

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


function handle3DFile(file) {
    modelReady = false;
    myModel = loadModel(MODEL_PATH + file.name, true, onModelLoaded);
}

function handleTexture(file) {
    textureReady = false;
    myTexture = loadImage(MODEL_PATH + file.name, onTextureLoaded);
}

function handleBGFile(file) {
    bgReady = false;
    bg = createVideo(MODEL_PATH + file.name, onBGLoaded);
}

function guiAddText(message, posX, posY) {
    let fileText;

    fileText = createP(message);
    fileText.style('font-size', '15px');
    fileText.position(posX, posY);
}

function updateXrot() {
    tempVal = this.value();
    xRot = (tempVal !== NaN) ? tempVal : xRot;
}

function updateYrot() {
    tempVal = this.value();
    yRot = (tempVal !== NaN) ? tempVal : xRot;
}

function updateZrot() {
    tempVal = this.value();
    zRot = (tempVal !== NaN)? tempVal : xRot;
}

function updateHue() {
    tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffset = tempVal;
    }
}

function updateFlash() {
    tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffset = tempVal;
    }
}

function updateHueBg() {
    tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffsetBg = tempVal;
    }
}

function updateFlashBg() {
    tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffsetBg = tempVal;
    }
}



function updateScale() {
    tempVal = this.value();
    scaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : scaleF;
}

function updateBGScale() {
    tempVal = parseInt(this.value());
    bgScaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : bgScaleF;
}

function updateMadness() {
    tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        updateColorDepth(tempVal);
    }
}

function updateMadnessFg() {
    tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthFg = tempVal;
    }
}

function updateMadnessBg() {
    tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthBg = tempVal;
    }
}


function asciiCheckEvent() {
    isAsciiOn = this.checked();
}

function ditherCheckEvent() {
    isDitherOn = this.checked();
}

function bwCheckEvent() {
    isBWOn = this.checked();
}

function bgDitherCheckEvent() {
    isBgDitherOn = this.checked();
}

function bgBwCheckEvent() {
    isBgBWOn = this.checked();
}

function matCheckEvent() {
    isMatOn = this.checked();
}

function saturationCheckEvent() {
    isSaturationMax = this.checked();
}

function mixCheckEvent() {
    isMixerOn = this.checked();
}

function preGlitchCheckEvent() {
    isPreGlitchOn = this.checked();
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
        }
    }



    //glitchType = glitchSelect.selected();
    let tempVal = parseInt(glitchDurInput.value());
    glitchFrames = ((tempVal !== NaN) && (tempVal > 0)) ? tempVal : 0;
    console.log("Triggered effects for frames: " +  glitchFrames);
}

function createGui() {
    let file3DSelector, textureSelector, bgSelector;
    let xRotInput, yRotInput, zRotInput, scaleInput, madInput, madInputFg, madInputBg;
    let hueOffInput, hueMadInput, hueOffInputBg, hueMadInputBg;
    let checkAScii, checkDither, checkBW, checkMat, checkSaturation;
    let bgCheckDither, bgCheckBW;
    let checkMixer;
    let glitchTriggerBtn;
    
    guiAddText("Select 3D file form Model Folder", DEFAULT_W + 50, 10);
    file3DSelector = createFileInput(handle3DFile);
    file3DSelector.position(DEFAULT_W + 50, 50);

    guiAddText("Select Texture form Model Folder", DEFAULT_W + 50, 80);
    textureSelector = createFileInput(handleTexture);
    textureSelector.position(DEFAULT_W + 50, 120);

    guiAddText("Hue Offset:", DEFAULT_W + 230, 110);
    hueOffInput = createInput('0');
    hueOffInput.position(DEFAULT_W + 300, 120);
    hueOffInput.size(40);
    hueOffInput.input(updateHue);

    guiAddText("Flashing:", DEFAULT_W + 360, 110);
    hueMadInput = createInput('0');
    hueMadInput.position(DEFAULT_W + 420, 120);
    hueMadInput.size(40);
    hueMadInput.input(updateFlash);

    guiAddText("X Rot:", DEFAULT_W + 50, 160);
    xRotInput = createInput('0');
    xRotInput.position(DEFAULT_W + 100, 170);
    xRotInput.size(40);
    xRotInput.input(updateXrot);

    guiAddText("Y Rot:", DEFAULT_W + 160, 160);
    yRotInput = createInput('0');
    yRotInput.position(DEFAULT_W + 210, 170);
    yRotInput.size(40);
    yRotInput.input(updateYrot);

    guiAddText("Z Rot:", DEFAULT_W + 270, 160);
    zRotInput = createInput('0');
    zRotInput.position(DEFAULT_W + 320, 170);
    zRotInput.size(40);
    zRotInput.input(updateZrot);

    guiAddText("Scale Factor:", DEFAULT_W + 50, 200);
    scaleInput = createInput('1');
    scaleInput.position(DEFAULT_W + 140, 222);
    scaleInput.size(40);
    scaleInput.input(updateScale);

    checkAScii = createCheckbox('ASCII', false);
    checkAScii.position(DEFAULT_W + 50, 250);
    checkAScii.changed(asciiCheckEvent);

    checkDither = createCheckbox('Dither FG', false);
    checkDither.position(DEFAULT_W + 50, 275);
    checkDither.changed(ditherCheckEvent);

    checkBW = createCheckbox('B&W FG', false);
    checkBW.position(DEFAULT_W + 50, 300);
    checkBW.changed(bwCheckEvent);

    checkMat = createCheckbox('Material FB', false);
    checkMat.position(DEFAULT_W + 50, 325);
    checkMat.changed(matCheckEvent);

    guiAddText("PAZZIA Factor:", DEFAULT_W + 50, 350);
    madInput = createInput('4');
    madInput.position(DEFAULT_W + 160, 362);
    madInput.size(40);
    madInput.input(updateMadness);

    guiAddText("FG:", DEFAULT_W + 220, 350);
    madInputFg = createInput('4');
    madInputFg.position(DEFAULT_W + 250, 362);
    madInputFg.size(40);
    madInputFg.input(updateMadnessFg);

    guiAddText("BG:", DEFAULT_W + 300, 350);
    madInputBg = createInput('4');
    madInputBg.position(DEFAULT_W + 330, 362);
    madInputBg.size(40);
    madInputBg.input(updateMadnessBg);

    gifBtn = createButton('SAVE GIF');
    gifBtn.position(DEFAULT_W + 50, 402);
    gifBtn.mousePressed(startSavingGIF);

    guiAddText("Select BG file form Model Folder", DEFAULT_W + 50, 420);
    bgSelector = createFileInput(handleBGFile);
    bgSelector.position(DEFAULT_W + 50, 460);

    guiAddText("BG Scale Factor:", DEFAULT_W + 50, 480);
    bgScaleInput = createInput('1');
    bgScaleInput.position(DEFAULT_W + 140, 500);
    bgScaleInput.size(40);
    bgScaleInput.input(updateBGScale);

    bgCheckDither = createCheckbox('Dither BG', false);
    bgCheckDither.position(DEFAULT_W + 50, 525);
    bgCheckDither.changed(bgDitherCheckEvent);

    bgCheckBW = createCheckbox('B&W BG', false);
    bgCheckBW.position(DEFAULT_W + 50, 550);
    bgCheckBW.changed(bgBwCheckEvent);

    guiAddText("Hue Offset:", DEFAULT_W + 50, 590);
    hueOffInputBg = createInput('0');
    hueOffInputBg.position(DEFAULT_W + 120, 600);
    hueOffInputBg.size(40);
    hueOffInputBg.input(updateHueBg);

    guiAddText("Flashing:", DEFAULT_W + 180, 590);
    hueMadInputBg = createInput('0');
    hueMadInputBg.position(DEFAULT_W + 240, 600);
    hueMadInputBg.size(40);
    hueMadInputBg.input(updateFlashBg);

    checkSaturation = createCheckbox('MaxSaturation', false);
    checkSaturation.position(DEFAULT_W + 300, 600);
    checkSaturation.changed(saturationCheckEvent);

    guiAddText("Glitch:", DEFAULT_W + 50, 640);
    glitchSelect = createSelect(true);
    glitchSelect.position(DEFAULT_W + 100, 640);
    glitchSelect.option('SCAN', 1);
    glitchSelect.option('SCRAMBLE', 2);
    glitchSelect.option('WARP', 3);

    guiAddText("Duration:", DEFAULT_W + 180, 630);
    glitchDurInput = createInput('0');
    glitchDurInput.position(DEFAULT_W + 240, 640);
    glitchDurInput.size(40);
    glitchPreCheck = createCheckbox('PreGlitch', true);
    glitchPreCheck.position(DEFAULT_W + 180, 680);
    glitchPreCheck.changed(preGlitchCheckEvent);
    glitchTriggerBtn = createButton('TRIGGER');
    glitchTriggerBtn.position(DEFAULT_W + 240, 720);
    glitchTriggerBtn.mousePressed(startGlitch);

    checkMixer = createCheckbox('Enable CH mixer', false);
    checkMixer.position(DEFAULT_W + 50, 800);
    checkMixer.changed(mixCheckEvent);
}


function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
}

function setup() {
    pixelDensity(1);
    createCanvas(DEFAULT_W, DEFAULT_H);
    _3dGraph = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);
    _2dGraph = createGraphics(DEFAULT_W, DEFAULT_H);

    initFonts(fontImage);
    initNoise();
    createGui();
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

    if ((isMatOn) || (textureReady !== true)) {
        _3dGraph.normalMaterial();
    } else {
        _3dGraph.texture(myTexture);
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

    let hyperPeriod = lcm3(xPeriod, yPeriod, zPeriod);
    console.log("Start saving gif, hyper period: " + hyperPeriod);

    saveGif('gifMatta', hyperPeriod, {  units: 'frames' });
}

function draw() {
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
                }
            }
            glitchFrames--;
        }
      
        if(isBgBWOn) {
            bgImage.filter(GRAY); 
        } else if (((hueOffsetBg % 360) != 0) || (flashOffsetBg != 0) || (isSaturationMax != 0)) {    
            ShiftHue(bgImage, hueOffsetBg, flashOffsetBg, isSaturationMax);
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
                }
            }

            glitchFrames--;
        }

        if (isMixerOn === false) {
            image(finalBg, 0, 0, DEFAULT_W, DEFAULT_H);
            //image(superFinalBG, 0, 0, DEFAULT_W, DEFAULT_H);
        }
    }

    if (modelReady) {
        let image2D = compute3D();

        // Downscale the image
        image2D.resize(DEFAULT_W / scaleF, DEFAULT_H / scaleF);
        addAlpha(image2D);

        if(isBWOn) {
            image2D.filter(GRAY); 
        } else if (((hueOffset % 360) != 0) || (flashOffset != 0)) {
            ShiftHue(image2D, hueOffset, flashOffset, false);
        }

        if (isDitherOn) {
            ditherIt(image2D, isBWOn, depthFg); 
        }

 
        //else if (isAsciiOn) {
        //    image2D = asciify(image2D, image2D);
        //}

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

    //gifBtn.mousePressed(startSavingGIF);
}