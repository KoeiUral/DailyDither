const COLOR_DEPTH = 4;
const FONT_SIZE = 26;

let fontImage;
let fontMap = [];


/**
 * This function up scale a source image without alliasing not blurring, pixel are replicated scaleFactor times
 * 
 * @param {*} srcImg Source image
 * @param {*} dstImg Result image
 * @param {*} scaleFactor Scale factor
 * @returns 
 */
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




/**
 * The function applies a dither filter on the image
 * 
 * @param {*} srcImg Source Image to be dithered
 */
function ditherIt(srcImg) {
    const xOffset = [1, -1, 0, 1];
    const yOffset = [0, 1, 1, 1];
    const weigth = [7, 3, 5, 1];
    const COLOR_MAX = 255;
    const COLOR_CH_NBR = 2; //COLOR_CH_NBR^3 colors, with 2 => 8 colors

    let r, g, b, newR, newG, newB, errR, errG, errB;
    let i, iNext;
    let colorFactor = COLOR_CH_NBR - 1;
    let colorScale = (COLOR_MAX / colorFactor);
    
    srcImg.loadPixels();
    
    // Iterate over each pixel 
    for (let y = 0; y < srcImg.height - 1; y++) {
        for (let x = 1; x < srcImg.width - 1; x++) { 
          i = (x + y * srcImg.width) * COLOR_DEPTH;
  
          r = srcImg.pixels[i];
          g = srcImg.pixels[i + 1];
          b = srcImg.pixels[i + 2];
          newR = round(colorFactor * r / COLOR_MAX) * colorScale;
          newG = round(colorFactor * g / COLOR_MAX) * colorScale;
          newB = round(colorFactor * b / COLOR_MAX) * colorScale;
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

/**
 * The function initializes a ascii set starting from a font image
 * 
 * @param {*} fontImg image containg all the fonts to be used
 */
function initFonts(fontImg) {
    const rowNbr = floor((fontImg.height) / FONT_SIZE);
    const colNbr = floor((fontImg.width) / FONT_SIZE);
    let i, j;
    let x, y;
    let startX, startY;
    let endX, endY;
    let pId;
    let brightCntr;

    fontImg.loadPixels();

    for (i = 0; i < rowNbr; i++) {
        for (j = 0; j < colNbr; j++) {
            startX = j * FONT_SIZE + 2;
            startY = i * FONT_SIZE + 2;
            endX = startX + FONT_SIZE;
            endY = startY + FONT_SIZE;
            brightCntr = 0;            

            for (y = startY; y < endY; y++) {
                for (x = startX; x < endX; x++) {
                    pId = (x + y * fontImg.width) * COLOR_DEPTH;

                    if ((fontImg.pixels[pId] === 255) && (fontImg.pixels[pId+1] === 255) && (fontImg.pixels[pId+2] === 255)) {
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

            if ((srcImg.pixels[i+3] === 255) && (! ((srcImg.pixels[i] === 0)&&(srcImg.pixels[i+1] === 0)&&(srcImg.pixels[i+2] === 0)))) {
                grayLevel = round(0.21 * srcImg.pixels[i] + 0.72 * srcImg.pixels[i + 1] + 0.07 * srcImg.pixels[i + 2]);
                fontId = ceil((fontMap.length - 1) * (grayLevel / 255));
            
                dstImage.copy(fontImage, fontMap[fontId].x, fontMap[fontId].y, 24, 24, x * fontW, y * fontH, fontW, fontH);
            }
        }
    }

    return dstImage;
}