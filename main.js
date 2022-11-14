const DEFAULT_W = 800;
const DEFAULT_H = 800;
const COLOR_DEPTH = 4;
const COLOR_CH_NBR = 2; // Equal to COLOR_CH_NBR^3 colors, with 2 => 8 colors
const COLOR_MAX = 255;

const FG_GRAY_SCALE = false;
const FG_ASCII = false;
const FG_DITHER = true;
const FG_SCALE_F = 10;

const BG_GRAY_SCALE = true;
const BG_ASCII = true;
const BG_DITHER = true;
const BG_SCALE_F = 20;

const ASCII_COLOR = true;

const X_ROT = 0.01;//0.01;
const Y_ROT = 0.01;//0.01;
const Z_ROT = 0.1;//0.01;


const xOffset = [1, -1, 0, 1];
const yOffset = [0, 1, 1, 1];
const weigth = [7, 3, 5, 1];

let myCanvas;
let myFont;
let noiseGen;
let zOff;

let myBgLayer;

//let myTex;
let myModel;
let _3dLayer;
let _3dGraph;


function findQuantumColor(r, g, b) {
    let colorFactor = COLOR_CH_NBR - 1;
    let colorScale = (COLOR_MAX / colorFactor);
    let newR = round(colorFactor * r / COLOR_MAX) * colorScale;
    let newG = round(colorFactor * g / COLOR_MAX) * colorScale;
    let newB = round(colorFactor * b / COLOR_MAX) * colorScale;
    
    return [newR, newG, newB];
  }


  function ditherIt(srcImg) {
    let r, g, b, newR, newG, newB, errR, errG, errB;
    let i, iNext;
    
    srcImg.loadPixels();
    
    // Iterate over each pixel 
    for (let y = 0; y < srcImg.height - 1; y++) {
        for (let x = 1; x < srcImg.width - 1; x++) { 
          i = (x + y * srcImg.width) * COLOR_DEPTH;
  
          r = srcImg.pixels[i];
          g = srcImg.pixels[i + 1];
          b = srcImg.pixels[i + 2];
          [newR, newG, newB] = findQuantumColor(r, g, b);
          errR = r - newR;
          errG = r - newG;
          errB = r - newB;
          
          srcImg.pixels[i + 0] = newR;
          srcImg.pixels[i + 1] = newG;
          srcImg.pixels[i + 2] = newB;
          
          for (let j = 0; j < 4; j++) {
            iNext = ((x + xOffset[j]) + (y + yOffset[j]) * srcImg.width) * COLOR_DEPTH;
            r = srcImg.pixels[iNext];
            g = srcImg.pixels[iNext + 1];
            b = srcImg.pixels[iNext + 2];
            r = r + errR * weigth[j]/16;
            g = g + errG * weigth[j]/16;
            b = b + errB * weigth[j]/16;
            srcImg.pixels[iNext + 0] = r;
            srcImg.pixels[iNext + 1] = g;
            srcImg.pixels[iNext + 2] = b;          
          }
        }
    }
    
    srcImg.updatePixels();
}


function hsv2rgb(h, s, v) {
    if (s == 0.0) {
        v *= COLOR_MAX;
        return [v, v, v];
    } 
    
    let i = Math.round(h / 360 * 6.0);
    let f = (h / 360 * 6.0) - i;

    let [p, q, t] = [Math.round(COLOR_MAX*(v*(1.0-s))), Math.round(COLOR_MAX*(v*(1.0-s*f))), Math.round(COLOR_MAX*(v*(1.0-s*(1.0-f))))];

    v*=COLOR_MAX; 
    i = i % 6;

    if (i == 0) {
        return [v, t, p];
    } else if (i == 1) {
        return [q, v, p];
    } else if (i == 2) {
        return [p, v, t];
    } else if (i == 3) {
        return [p, q, v];
    } else if (i == 4) {
        return [t, p, v];
    } else if (i == 5) {
        return [v, p, q];
    } else {
        return [0, 0, 0];
    }
}

const grayRamp = ' _.,-=+:;cba!?0123456789$W#@Ñ';
const rampLength = grayRamp.length;
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];

function textify(grayLevel, x, y, w, h, grayFlag) {
    let pixelChar;

    pixelChar = getCharacterForGrayScale(grayLevel);
    grayLevel = (grayFlag) ? grayLevel : 255;

    fill(0);
    rect(x * w, y * h, w, h);
    fill(grayLevel);
    textSize(w);
    textAlign(CENTER, CENTER);
    text(pixelChar, x * w + w * 0.5, y * h + h * 0.5);  
}

function asciifyIt(srcImg) {
    let x, y;
    let grayLevel;

    let w = width / srcImg.width;
    let h = height / srcImg.height;

    srcImg.loadPixels();
    noStroke();

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            grayLevel = toGrayScale(srcImg.pixels[i], srcImg.pixels[i + 1], srcImg.pixels[i + 2]);

            if (srcImg.pixels[i+3]===255) {
                textify (grayLevel, x, y, w, h, FG_GRAY_SCALE);
            }
        }
    }

}


function windowResized() {
    //let maxW = min(windowWidth, DEFAULT_W);
    //let maxH = min(windowHeight, DEFAULT_H);
    //let xScale = maxW / canvas.width;
    //let yScale = maxH / canvas.height;

    //resizeCanvas(maxW, maxH, false);

}

function preload() {
    myModel = loadModel('model/xFede.obj', true);
    myFont = loadFont('font/C64_Pro_Mono-STYLE.TTF');
    //myTex = loadImage('model/xFede.mtl');
}

function setup() {
    //let maxW = min(windowWidth, DEFAULT_W);
    //let maxH = min(windowHeight, DEFAULT_H);

    // Create the P5 Canvas
    createCanvas(DEFAULT_W, DEFAULT_H);
    _3dGraph = createGraphics(DEFAULT_W, DEFAULT_H, WEBGL);
    textFont(myFont);

    myBgLayer = createImage(DEFAULT_W / BG_SCALE_F, DEFAULT_H / BG_SCALE_F);
    noiseGen = new OpenSimplexNoise(Date.now());
    zOff = 0;
}

function addAlpha(srcImg) {
    let x, y;

    srcImg.loadPixels();

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            if ((srcImg.pixels[i] === 0)&&(srcImg.pixels[i+1] === 0)&&(srcImg.pixels[i+2] === 0)) {
                srcImg.pixels[i+3] = 0;
            } else {
                srcImg.pixels[i+3] = 255;
            }
        }
    }
    srcImg.updatePixels();
}

function computeBg(bgImg) {
    const increment = 0.03;
    let xOff = 0;
    let yOff = 0;
    let x, y, i;
    let grayLevel;

    let w = width / bgImg.width;
    let h = height / bgImg.height;
    let maxLevel = (BG_GRAY_SCALE) ? 255 : 360;;

    bgImg.loadPixels();

    for (y = 0; y < bgImg.height; y++) {
        xOff = 0;
        for (x = 0; x < bgImg.width; x++) {
            i = (x + y * bgImg.width) * COLOR_DEPTH;

            grayLevel = floor(map(noiseGen.noise3D(xOff, yOff, zOff), -1, 1, 0, maxLevel));

            if (BG_ASCII) {
                textify(grayLevel, x, y, w, h, BG_GRAY_SCALE);
            }
            else if (BG_GRAY_SCALE) {
                bgImg.pixels[i] = grayLevel;
                bgImg.pixels[i + 1] = grayLevel;
                bgImg.pixels[i + 2] = grayLevel;
                bgImg.pixels[i + 3] = 255;
            }
            else {
                [bgImg.pixels[i], bgImg.pixels[i+1], bgImg.pixels[i+2]]= hsv2rgb(grayLevel, 1, 1);
                bgImg.pixels[i + 3] = 255;
            }

            xOff += increment;
        }
        yOff += increment;
    }

    zOff += increment;

    if (BG_ASCII === false) {
        bgImg.updatePixels();
    }
}

function compute3D() {
    _3dGraph.reset();
    _3dGraph.background(0);

    _3dGraph.scale(3); // Scaled to make model fit into canvas
    //_3dLayer.rotateX(frameCount * 0.01);
    _3dGraph.rotateX(PI);
    _3dGraph.rotateY(PI/2);
    _3dGraph.rotateX(frameCount * X_ROT);
    _3dGraph.rotateY(frameCount * Y_ROT);
    _3dGraph.rotateZ(frameCount * Z_ROT);
    _3dGraph.normalMaterial(); // For effect
    // _3dLayer.texture(myTex);
    _3dGraph.model(myModel);
}

function upScale(srcImg, dstImg, scaleFactor) {
    let sx, sy, dx, dy;
    let si, di;

    dstImg = createImage(srcImg.width * scaleFactor, srcImg.height * scaleFactor);

    srcImg.loadPixels();
    dstImg.loadPixels();

    // Iterate over the source image
    for (sy = 0; sy < srcImg.height; sy++) {
        for (sx = 0; sx < srcImg.width; sx++) {
            si = (sx + sy * srcImg.width) * COLOR_DEPTH;

            // Copy into the upscaled dest pixel
            for (dy = 0; dy < scaleFactor; dy++) {
                for (dx = 0; dx < scaleFactor; dx++) {
                    di = ((sx * scaleFactor + dx) + (sy * scaleFactor + dy) * dstImg.width) * COLOR_DEPTH;

                    dstImg.pixels[di] = srcImg.pixels[si];
                    dstImg.pixels[di + 1] = srcImg.pixels[si + 1];
                    dstImg.pixels[di + 2] = srcImg.pixels[si + 2];
                    dstImg.pixels[di + 3] = srcImg.pixels[si + 3];
                }
            }
        }
    }

    dstImg.updatePixels(); 
    return dstImg;
}

function draw() {
    background(0);

    computeBg(myBgLayer);

    if (BG_DITHER) {
        ditherIt(myBgLayer);
    }

    let finalBg;
    finalBg =  upScale(myBgLayer, finalBg, BG_SCALE_F);

    if (BG_ASCII === false) {
        image(finalBg, 0, 0, DEFAULT_W, DEFAULT_H);
    }

    compute3D();
    _3dLayer = (_3dGraph.get());
    _3dLayer.resize(DEFAULT_W / FG_SCALE_F, DEFAULT_H / FG_SCALE_F);
    addAlpha(_3dLayer);

    if (FG_ASCII) {
        asciifyIt(_3dLayer);
    } else if (FG_DITHER) {
        if (FG_GRAY_SCALE) {
            _3dLayer.filter(GRAY);
        }
        ditherIt(_3dLayer);
    }

    let finalFg;
    finalFg = upScale(_3dLayer, finalFg, FG_SCALE_F);
    if (FG_ASCII === false) {
        image(finalFg, 0, 0, DEFAULT_W, DEFAULT_H);
    }
}
