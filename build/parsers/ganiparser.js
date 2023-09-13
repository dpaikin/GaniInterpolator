"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGani = exports.parseGani = void 0;
const fs_1 = __importDefault(require("fs"));
const parseGani = (filename) => {
    const frames = new Map();
    const fileContent = fs_1.default.readFileSync(`./input/${filename}`, 'utf-8');
    const lines = fileContent.split('\n');
    let parseMode = 'data';
    let currentFrame = null;
    let currentFrameCount = 0;
    let looping = false;
    const nextFrame = () => {
        parseMode = 'frame';
        currentFrame = {
            delay: 1,
            directions: new Map,
            id: currentFrameCount,
            sounds: []
        };
    };
    const data = [];
    for (const line of lines) {
        if (line.startsWith('LOOP'))
            looping = true;
        if (line.startsWith('ANIEND'))
            break;
        if (line.startsWith('ANI')) {
            nextFrame();
            currentFrameCount++;
            continue;
        }
        if (parseMode == 'data') {
            data.push(line);
            continue;
        }
        if (line.trim() == '' && parseMode == 'frame') {
            frames.set(currentFrameCount - 1, currentFrame);
            nextFrame();
            currentFrameCount++;
            continue;
        }
        if (line.trim() == '')
            continue;
        if (line.startsWith('PLAYSOUND') && parseMode == 'frame') {
            const split = line.split(' ');
            currentFrame.sounds.push({
                filename: split[1],
                x: parseFloat(split[2]),
                y: parseFloat(split[3])
            });
            continue;
        }
        if (parseMode == 'frame') {
            if (line.startsWith('WAIT')) {
                const delay = parseFloat(line.split(' ')[1]);
                currentFrame.delay = delay + 1;
                continue;
            }
            const spritesSplit = line.split(',');
            const sprites = new Map();
            let spriteCount = 0;
            for (const spriteSplit of spritesSplit) {
                const spriteDetailsSplit = spriteSplit.split(/(\s+)/).filter(e => e.trim().length > 0);
                const sprite = {
                    spriteId: parseInt(spriteDetailsSplit[0]),
                    x: parseInt(spriteDetailsSplit[1]),
                    y: parseInt(spriteDetailsSplit[2])
                };
                sprites.set(spriteCount++, sprite);
            }
            const currentDir = currentFrame.directions.size;
            currentFrame.directions.set(currentDir, sprites);
        }
    }
    let totalLength = 0;
    for (const [, frame] of frames)
        totalLength += frame.delay;
    return {
        data: data,
        filename: filename,
        frames: frames,
        totalLength: totalLength,
        looping: looping
    };
};
exports.parseGani = parseGani;
const saveGani = (gani) => {
    console.log('Saving ' + (gani === null || gani === void 0 ? void 0 : gani.filename));
    let lines = gani.data;
    lines = lines.map(l => l + '\n');
    lines.push('ANI\r\n');
    for (const [id, frame] of gani.frames.entries()) {
        for (const [dir, sprites] of frame.directions) {
            let currentLine = '  ';
            for (let [i, sprite] of sprites.entries()) {
                if (i != 0)
                    currentLine += '   ';
                currentLine += sprite.spriteId + '   ' + sprite.x + '   ' + sprite.y + ',';
            }
            currentLine = currentLine.substring(0, currentLine.length - 1);
            lines.push(currentLine + '\r\n');
        }
        for (const sound of frame.sounds)
            lines.push('PLAYSOUND ' + sound.filename + ' ' + sound.x + ' ' + sound.y + '\r\n');
        if ((frame === null || frame === void 0 ? void 0 : frame.delay) != 1)
            lines.push('WAIT ' + (frame.delay - 1) + '\r\n');
        lines.push('\r\n');
    }
    lines.push('ANIEND');
    fs_1.default.writeFileSync('./output/' + (gani === null || gani === void 0 ? void 0 : gani.filename), lines.join(''));
};
exports.saveGani = saveGani;
