
/**
 * Global visibility Widgets
 */
let fgSatSlider;
let bgSatSlider;



/**
 * Create the Gui: create widgets and set them up
 */

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



function updateXrot() {
    let tempVal = parseFloat(this.value());
    xRot = (isNaN(tempVal)) ? xRot : tempVal;
    console.log(tempVal + " -> " + xRot);
}

function updateYrot() {
    let tempVal = parseFloat(this.value());
    yRot = (isNaN(tempVal)) ? yRot : tempVal;
}

function updateZrot() {
    let tempVal = parseFloat(this.value());
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


//function asciiCheckEvent() {
//    isAsciiOn = this.checked();
//}

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

//function matCheckEvent() {
//   isMatOn = this.checked();
//}

function mixCheckEvent() {
    isMixerOn = this.checked();
}

function preGlitchCheckEvent() {
    isPreGlitchOn = this.checked();
}

/*
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
*/

/**
 * Create the Gui: create widgets and set them up
 */

function create_gui() {
    let file3DSelector, textureSelector, bgSelector;
    let xRotInput, yRotInput, zRotInput, scaleInput, madInput, madInputFg, madInputBg;
    let hueOffInput, hueMadInput, hueOffInputBg, hueMadInputBg;
    let checkDither, checkBW;
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
    glitchSelect.option('BURN', 4);

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