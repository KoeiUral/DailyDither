const DEFAULT_W = 600;
const DEFAULT_H = 600;
let myCanvas;

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
let fgSatSlider;
let bgSatSlider;

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
    let tempVal = parseInt(this.value());
    xRot = (isNaN(tempVal)) ? xRot : tempVal;
}

function updateYrot() {
    let tempVal = parseInt(this.value());
    yRot = (isNaN(tempVal)) ? yRot : tempVal;
}

function updateZrot() {
    let tempVal = parseInt(this.value());
    zRot = (isNaN(tempVal)) ? zRot : tempVal;
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
    let checkAScii, checkDither, checkBW, checkMat;
    let bgCheckDither, bgCheckBW;
    let checkMixer;
    let glitchTriggerBtn;

    /* Hook the canvas */
    myCanvas.parent('html_canvas');
    
    /* ------ FG SECTION ------ */
    file3DSelector = createFileInput(handle3DFile);
    textureSelector = createFileInput(handleTexture);

    xRotInput = createInput('0');
    xRotInput.size(40);
    xRotInput.input(updateXrot);

    yRotInput = createInput('0');
    yRotInput.size(40);
    yRotInput.input(updateYrot);

    zRotInput = createInput('0');
    zRotInput.size(40);
    zRotInput.input(updateZrot);

    /* TODO: Add translation inputs */

    scaleInput = createInput('1');
    scaleInput.size(40);
    scaleInput.input(updateScale);

    checkDither = createCheckbox('Dither FG', false);
    checkDither.changed(ditherCheckEvent);

    checkBW = createCheckbox('B&W FG', false);
    checkBW.changed(bwCheckEvent);

    hueOffInput = createInput('0');
    hueOffInput.size(40);
    hueOffInput.input(updateHue);

    hueMadInput = createInput('0');
    hueMadInput.size(40);
    hueMadInput.input(updateFlash);

    fgSatSlider = createSlider(0, 1, 0, 0.05);
    fgSatSlider.size(120);

    /* Hook widget to html */
    file3DSelector.parent('html_file3DSelector');
    textureSelector.parent('html_fileTexSelector');
    xRotInput.parent('html_xRotInput');
    yRotInput.parent('html_yRotInput');
    zRotInput.parent('html_zRotInput');
    checkDither.parent('html_fgCheckDither');
    checkBW.parent('html_fgCheckBW');
    scaleInput.parent('html_fgScaleInput');
    hueOffInput.parent('html_fgHueInput');
    hueMadInput.parent('html_fgFlashInput');
    fgSatSlider.parent('html_fgSatSlider');

    /* ------ PAZZIA SECTION ------ */
    madInput = createInput('4');
    madInput.size(40);
    madInput.input(updateMadness);

    madInputFg = createInput('4');
    madInputFg.size(40);
    madInputFg.input(updateMadnessFg);

    madInputBg = createInput('4');
    madInputBg.size(40);
    madInputBg.input(updateMadnessBg);

    /* Hook widget to html */
    madInput.parent('html_madInput');
    madInputFg.parent('html_madInputFg');
    madInputBg.parent('html_madInputBg');


    /* ------ BG SECTION ------ */
    bgSelector = createFileInput(handleBGFile);

    bgScaleInput = createInput('1');
    bgScaleInput.size(40);
    bgScaleInput.input(updateBGScale);

    bgCheckDither = createCheckbox('Dither BG', false);
    bgCheckDither.changed(bgDitherCheckEvent);

    bgCheckBW = createCheckbox('B&W BG', false);
    bgCheckBW.changed(bgBwCheckEvent);

    hueOffInputBg = createInput('0');
    hueOffInputBg.size(40);
    hueOffInputBg.input(updateHueBg);

    hueMadInputBg = createInput('0');
    hueMadInputBg.size(40);
    hueMadInputBg.input(updateFlashBg);

    bgSatSlider = createSlider(0, 1, 0, 0.05);
    bgSatSlider.size(120);

    glitchSelect = createSelect(true);
    glitchSelect.option('SCAN', 1);
    glitchSelect.option('SCRAMBLE', 2);
    glitchSelect.option('WARP', 3);

    glitchDurInput = createInput('0');
    glitchDurInput.size(40);
    glitchPreCheck = createCheckbox('PreGlitch', true);
    glitchPreCheck.changed(preGlitchCheckEvent);
    glitchTriggerBtn = createButton('TRIGGER');
    glitchTriggerBtn.mousePressed(startGlitch);

    /* Hook widget to html */
    bgSelector.parent('html_bgSelector');
    bgCheckDither.parent('html_bgCheckDither');
    bgCheckBW.parent('html_bgCheckBW');
    bgScaleInput.parent('html_bgScaleInput');
    hueOffInputBg.parent('html_bgHueInput');
    hueMadInputBg.parent('html_bgFlashInput');
    bgSatSlider.parent('html_bgSatSlider');
    glitchSelect.parent('html_bgGlitchSelect');
    glitchDurInput.parent('html_bgGlitchDurInput');
    glitchPreCheck.parent('html_bgGlitchPreCheck');
    glitchTriggerBtn.parent('html_bgGlitchTriggerBtn');

    /* ------ EXPORT SECTION ------ */
    gifBtn = createButton('SAVE GIF');
    gifBtn.mousePressed(startSavingGIF);

    checkMixer = createCheckbox('Enable CH mixer', false);
    checkMixer.changed(mixCheckEvent);

    /* Hook widget to html */
    gifBtn.parent('html_gifBtn');
    checkMixer.parent('html_checkMixer');
}


function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
}

function setup() {
    pixelDensity(1);
    myCanvas = createCanvas(DEFAULT_W, DEFAULT_H);
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
        } else if (((hueOffset % 360) != 0) || (flashOffset != 0) || (fgSatSlider.value() != 0)) {  
            ShiftHue(image2D, hueOffset, flashOffset, fgSatSlider.value());
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