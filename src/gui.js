
/**
 * Global visibility Widgets
 */
let fgSatSlider;
let bgSatSlider;


const WIDGET_SIZE = 50;


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



function updateXP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(0, tempVal);
    }
}

function updateYP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(1, tempVal);
    }
}

function updateZP1() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(2, tempVal);
    }
}

function updateXP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(3, tempVal);
    }
}

function updateYP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(4, tempVal);
    }
}

function updateZP2() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(5, tempVal);
    }
}

function updateXP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(6, tempVal);
    }
}

function updateYP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(7, tempVal);
    }
}

function updateZP3() {
    let tempVal = parseInt(this.value());
    if (isNaN(tempVal) === false) {
        updateTranslationTargets(8, tempVal);
    }
}






function updateHue() {
    let tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffset = tempVal;
    }
}

function updateFlash() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffset = tempVal;
    }
}

function updateHueBg() {
    let tempVal = parseInt(this.value());
    if (tempVal !== NaN) {
        hueOffsetBg = tempVal;
    }
}

function updateFlashBg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 0)) {
        flashOffsetBg = tempVal;
    }
}

function updateScale() {
    let tempVal = this.value();
    scaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : scaleF;
}

function updateBGScale() {
    let tempVal = parseInt(this.value());
    bgScaleF = ((tempVal !== NaN) && (tempVal >= 1))  ? tempVal : bgScaleF;
}

function updateMadness() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        updateColorDepth(tempVal);
    }
}

function updateMadnessFg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthFg = tempVal;
    }
}

function updateMadnessBg() {
    let tempVal = parseInt(this.value());
    if ((tempVal !== NaN) && (tempVal >= 1)) {
        depthBg = tempVal;
    }
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

function mixCheckEvent() {
    isMixerOn = this.checked();
}

function preGlitchCheckEvent() {
    isPreGlitchOn = this.checked();
}

function updateGifPeriof() {
    let tempVal = parseInt(this.value());
    gifDuration = (isNaN(tempVal)) ? 0 : tempVal;
}


/**
 * Create the Gui: create widgets and set them up
 */

function create_gui() {
    let file3DSelector, textureSelector, bgSelector;
    let xRotInput, yRotInput, zRotInput;
    let xP1Input, yP1Input, zP1Input, xP2Input, yP2Input, zP2Input, xP3Input, yP3Input, zP3Input; 
    let scaleInput, madInput, madInputFg, madInputBg;
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
    xRotInput.size(WIDGET_SIZE);
    xRotInput.input(updateXrot);

    yRotInput = createInput('0');
    yRotInput.size(WIDGET_SIZE);
    yRotInput.input(updateYrot);

    zRotInput = createInput('0');
    zRotInput.size(WIDGET_SIZE);
    zRotInput.input(updateZrot);

    /* TODO: Add translation inputs */
    xP1Input = createInput(DEFAULT_W / 2);
    xP1Input.size(WIDGET_SIZE);
    xP1Input.input(updateXP1);
    yP1Input = createInput(DEFAULT_H / 2);
    yP1Input.size(WIDGET_SIZE);
    yP1Input.input(updateYP1);
    zP1Input = createInput('0');
    zP1Input.size(WIDGET_SIZE);
    zP1Input.input(updateZP1);
    xP2Input = createInput(DEFAULT_W / 2);
    xP2Input.size(WIDGET_SIZE);
    xP2Input.input(updateXP2);
    yP2Input = createInput(DEFAULT_H / 2);
    yP2Input.size(WIDGET_SIZE);
    yP2Input.input(updateYP2);
    zP2Input = createInput('0');
    zP2Input.size(WIDGET_SIZE);
    zP2Input.input(updateZP2);
    xP3Input = createInput(DEFAULT_W / 2);
    xP3Input.size(WIDGET_SIZE);
    xP3Input.input(updateXP3);
    yP3Input = createInput(DEFAULT_H / 2);
    yP3Input.size(WIDGET_SIZE);
    yP3Input.input(updateYP3);
    zP3Input = createInput('0');
    zP3Input.size(WIDGET_SIZE);
    zP3Input.input(updateZP3);

    scaleInput = createInput('1');
    scaleInput.size(WIDGET_SIZE);
    scaleInput.input(updateScale);

    checkDither = createCheckbox('Dither FG', false);
    checkDither.changed(ditherCheckEvent);

    checkBW = createCheckbox('B&W FG', false);
    checkBW.changed(bwCheckEvent);

    hueOffInput = createInput('0');
    hueOffInput.size(WIDGET_SIZE);
    hueOffInput.input(updateHue);

    hueMadInput = createInput('0');
    hueMadInput.size(WIDGET_SIZE);
    hueMadInput.input(updateFlash);

    fgSatSlider = createSlider(0, 1, 0, 0.05);
    fgSatSlider.size(120);

    /* Hook widget to html */
    file3DSelector.parent('html_file3DSelector');
    textureSelector.parent('html_fileTexSelector');
    xRotInput.parent('html_xRotInput');
    yRotInput.parent('html_yRotInput');
    zRotInput.parent('html_zRotInput');
    xP1Input.parent('html_xP1Input');
    yP1Input.parent('html_yP1Input');
    zP1Input.parent('html_zP1Input');
    xP2Input.parent('html_xP2Input');
    yP2Input.parent('html_yP2Input');
    zP2Input.parent('html_zP2Input');
    xP3Input.parent('html_xP3Input');
    yP3Input.parent('html_yP3Input');
    zP3Input.parent('html_zP3Input');
    checkDither.parent('html_fgCheckDither');
    checkBW.parent('html_fgCheckBW');
    scaleInput.parent('html_fgScaleInput');
    hueOffInput.parent('html_fgHueInput');
    hueMadInput.parent('html_fgFlashInput');
    fgSatSlider.parent('html_fgSatSlider');

    /* ------ PAZZIA SECTION ------ */
    madInput = createInput('4');
    madInput.size(WIDGET_SIZE);
    madInput.input(updateMadness);

    madInputFg = createInput('4');
    madInputFg.size(WIDGET_SIZE);
    madInputFg.input(updateMadnessFg);

    madInputBg = createInput('4');
    madInputBg.size(WIDGET_SIZE);
    madInputBg.input(updateMadnessBg);

    /* Hook widget to html */
    madInput.parent('html_madInput');
    madInputFg.parent('html_madInputFg');
    madInputBg.parent('html_madInputBg');


    /* ------ BG SECTION ------ */
    bgSelector = createFileInput(handleBGFile);

    bgScaleInput = createInput('1');
    bgScaleInput.size(WIDGET_SIZE);
    bgScaleInput.input(updateBGScale);

    bgCheckDither = createCheckbox('Dither BG', false);
    bgCheckDither.changed(bgDitherCheckEvent);

    bgCheckBW = createCheckbox('B&W BG', false);
    bgCheckBW.changed(bgBwCheckEvent);

    hueOffInputBg = createInput('0');
    hueOffInputBg.size(WIDGET_SIZE);
    hueOffInputBg.input(updateHueBg);

    hueMadInputBg = createInput('0');
    hueMadInputBg.size(WIDGET_SIZE);
    hueMadInputBg.input(updateFlashBg);

    bgSatSlider = createSlider(0, 1, 0, 0.05);
    bgSatSlider.size(120);

    glitchSelect = createSelect(true);
    glitchSelect.option('SCAN', 1);
    glitchSelect.option('SCRAMBLE', 2);
    glitchSelect.option('WARP', 3);
    glitchSelect.option('BURN', 4);

    glitchDurInput = createInput('0');
    glitchDurInput.size(WIDGET_SIZE);
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
    checkMixer = createCheckbox('Enable CH mixer', false);
    checkMixer.changed(mixCheckEvent);

    gifDurationInput =  createInput('0');
    gifDurationInput.size(WIDGET_SIZE);
    gifDurationInput.input(updateGifPeriof);

    gifBtn = createButton('SAVE GIF');
    gifBtn.mousePressed(startSavingGIF);

    /* Hook widget to html */
    gifBtn.parent('html_gifBtn');
    checkMixer.parent('html_checkMixer');
    gifDurationInput.parent('html_gifDurInput');
}