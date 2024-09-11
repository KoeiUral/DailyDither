const DEFAULT_W = 800;
const DEFAULT_H = 800;
const COLOR_DEPTH = 4;
const COLOR_CH_NBR = 2; // Equal to COLOR_CH_NBR^3 colors, with 2 => 8 colors
const COLOR_MAX = 255;




const xOffset = [1, -1, 0, 1];
const yOffset = [0, 1, 1, 1];
const weigth = [7, 3, 5, 1];

let myCanvas;




const grayRamp = ' _.,-=+:;cba!?0123456789$W#@Ñ';
const rampLength = grayRamp.length;
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];

function textify(grayLevel, x, y, w, h, grayFlag) {
    let pixelChar;

 
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
                pixelChar = getCharacterForGrayScale(grayLevel);
            
                fill(0);
                rect(x * w, y * h, w, h);
                fill(grayLevel);
                textSize(w);
                textAlign(CENTER, CENTER);
                text(pixelChar, x * w + w * 0.5, y * h + h * 0.5); 
            }
        }
    }

}

function asciify(srcImg, dstImage) {
    let x, y;
    let grayLevel;
    let fontId;

    let fontW = width / srcImg.width;
    let fontH = height / srcImg.height;

    srcImg.loadPixels();
    dstImage = new createImage(width, height);

    // Iterate over each pixel 
    for (y = 0; y < srcImg.height; y++) {
        for (x = 0; x < srcImg.width; x++) { 
            i = (x + y * srcImg.width) * COLOR_DEPTH;

            if (srcImg.pixels[i+3] === 255) {
                grayLevel = round(0.21 * srcImg.pixels[i] + 0.72 * srcImg.pixels[i + 1] + 0.07 * srcImg.pixels[i + 2]);
                fontId = ceil((fontMap.length - 1) * (grayLevel / 255));
            
                dstImage.copy(fontImage, fontMap[fontId].x, fontMap[fontId].y, 24, 24, x * fontW, y * fontH, fontW, fontH);
            }
        }
    }

    return dstImage;
}

let fontImage;
let fontMap = [];
const FONT_SIZE = 26;

function initFonts(srcImg) {
    const rowNbr = floor(srcImg.height / FONT_SIZE);
    const colNbr = floor(srcImg.width / FONT_SIZE);
    let i, j;
    let x, y;
    let startX, startY;
    let endX, endY;
    let pId;
    let brightCntr;

    srcImg.loadPixels();

    for (i = 0; i < rowNbr; i++) {
        for (j = 0; j < colNbr; j++) {
            startX = j * FONT_SIZE + 2;
            startY = i * FONT_SIZE + 2;
            endX = startX + FONT_SIZE;
            endY = startY + FONT_SIZE;
            brightCntr = 0;            

            for (y = startY; y < endY; y++) {
                for (x = startX; x < endX; x++) {
                    pId = (x + y * srcImg.width) * COLOR_DEPTH;

                    if ((srcImg.pixels[pId] === 255) && (srcImg.pixels[pId+1] === 255) && (srcImg.pixels[pId+2] === 255)) {
                        brightCntr++;
                    }
                }
            }

            fontMap.push({r: i, c: j, x: startX, y: startY, br: brightCntr});
        }
    }


    fontMap.sort((a, b) => {
        return a.br - b.br;
    });

}


function windowResized() {
    //let maxW = min(windowWidth, DEFAULT_W);
    //let maxH = min(windowHeight, DEFAULT_H);
    //let xScale = maxW / canvas.width;
    //let yScale = maxH / canvas.height;

    //resizeCanvas(maxW, maxH, false);

}

function preload() {
    fontImage = loadImage("./font/c64Ascii.png");
    maggieImage = loadImage("./src/maggie.jpg");
}

function setup() {
    let dest;
    let factor = 1;
    let zoom = 10;

    //let myCanvas = createCanvas(800, 800, P2D);
    let myCanvas = createCanvas(maggieImage.width * zoom, maggieImage.height * zoom, P2D);

    //drawingContext.willReadFrequently = true;
    //setAttributes('willReadFrequently', true);

    //const canvas = document.createElement('canvas');
    const ctx = myCanvas.canvas.getContext('2d', { willReadFrequently: true });  // NON FUNZIONA!!!
    maggieImage.resize(maggieImage.width / factor, maggieImage.height / factor);

    background(0);
    
    initFonts(fontImage);
    dest = asciify(maggieImage, dest);

    image(dest, 0, 0);

 //   for (const item of fontMap) {
//        console.log("i: %d, j:%d - (%d, %d) -> br: %f", item.r, item.c, item.x, item.y, item.br);
//    }

}

function draw() {
    //
}
