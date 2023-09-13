"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ganiparser_1 = require("./parsers/ganiparser");
const main = () => {
    const inputFiles = fs_1.default.readdirSync('./input/');
    console.log(`Interpolating ${inputFiles.length} ganis...`);
    for (const inputFile of inputFiles) {
        const gani = (0, ganiparser_1.parseGani)(inputFile);
        console.log('Loaded ' + (gani === null || gani === void 0 ? void 0 : gani.frames.size) + ' frames of ' + (gani === null || gani === void 0 ? void 0 : gani.filename) + ' (' + (gani === null || gani === void 0 ? void 0 : gani.totalLength) + ' ticks) (' + (gani.totalLength / 20) + 's)');
        console.log(gani);
        const interpolate = interpolateGani(gani);
        (0, ganiparser_1.saveGani)(interpolate);
        // console.log(interpolate)
    }
};
const interpolateFrames = (start, end) => {
    const dirCount = start.directions.size;
    const nf1 = {
        delay: start.delay,
        directions: new Map(),
        id: -1,
        sounds: []
    };
    const nf2 = {
        delay: start.delay,
        directions: new Map(),
        id: -1,
        sounds: []
    };
    for (let dir = 0; dir < dirCount; dir++) {
        const sameSprites = [...start.directions.get(dir)]
            // .map(([,s]) => s.spriteId)
            .filter(([index, s]) => [...end === null || end === void 0 ? void 0 : end.directions.get(dir)].map(([, j]) => j.spriteId).includes(s.spriteId));
        for (const sameSprite of sameSprites) {
            const spriteIndex = sameSprite[0];
            const spriteId = sameSprite[1].spriteId;
            const p1 = {
                x: [...start.directions.get(dir)].find(([, s]) => s.spriteId == spriteId)[1].x,
                y: [...start.directions.get(dir)].find(([, s]) => s.spriteId == spriteId)[1].y
            };
            const p2 = {
                x: [...end.directions.get(dir)].find(([, s]) => s.spriteId == spriteId)[1].x,
                y: [...end.directions.get(dir)].find(([, s]) => s.spriteId == spriteId)[1].y
            };
            const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const np1 = {
                x: Math.round(p1.x + Math.cos(angle) * dist * .33),
                y: Math.round(p1.y + Math.sin(angle) * dist * .33)
            };
            const np2 = {
                x: Math.round(p1.x + Math.cos(angle) * dist * .66),
                y: Math.round(p1.y + Math.sin(angle) * dist * .66)
            };
            let cd1Sprites = nf1.directions.get(dir);
            if (cd1Sprites == null || cd1Sprites == undefined)
                cd1Sprites = new Map();
            cd1Sprites.set(spriteIndex, {
                spriteId: spriteId,
                x: np1.x,
                y: np1.y
            });
            nf1.directions.set(dir, cd1Sprites);
            let cd2Sprites = nf2.directions.get(dir);
            if (cd2Sprites == null || cd2Sprites == undefined)
                cd2Sprites = new Map();
            cd2Sprites.set(spriteIndex, {
                spriteId: spriteId,
                x: np2.x,
                y: np2.y
            });
            nf2.directions.set(dir, cd2Sprites);
        }
        // const sameSprites = [...start!.directions.get(dir)!]
        //     // .map(([,s]) => s.spriteId)
        //     .filter(([index, s]) => [...end?.directions.get(dir)!].map(([,j]) => j.spriteId).includes(s.spriteId))
        const diffSpritesStart = [...start.directions.get(dir)]
            // .map(s => s.spriteId)
            .filter(([i, s]) => !sameSprites.map(([, s]) => s.spriteId).includes(s.spriteId));
        for (const diffSprite of diffSpritesStart) {
            const spriteTuple = [...start.directions.get(dir)].find(([i, s]) => s.spriteId == diffSprite[1].spriteId);
            const spriteIndex = spriteTuple[0];
            const sprite = spriteTuple[1];
            let cd1Sprites = nf1.directions.get(dir);
            if (cd1Sprites == null || cd1Sprites == undefined)
                cd1Sprites = new Map();
            cd1Sprites.set(spriteIndex, {
                spriteId: sprite.spriteId,
                x: sprite.x,
                y: sprite.y
            });
        }
        const diffSpritesEnd = [...end.directions.get(dir)]
            .filter(([i, s]) => !sameSprites.map(([, s]) => s.spriteId).includes(s.spriteId));
        for (const diffSprite of diffSpritesEnd) {
            const spriteTuple = [...end.directions.get(dir)].find(([i, s]) => s.spriteId == diffSprite[1].spriteId);
            const spriteIndex = spriteTuple[0];
            const sprite = spriteTuple[1];
            let cd2Sprites = nf2.directions.get(dir);
            if (cd2Sprites == null || cd2Sprites == undefined)
                cd2Sprites = new Map();
            cd2Sprites.set(spriteIndex, {
                spriteId: sprite.spriteId,
                x: sprite.x,
                y: sprite.y
            });
        }
    }
    return [nf1, nf2];
};
const interpolateGani = (gani) => {
    var _a;
    console.log('Interpolating ' + (gani === null || gani === void 0 ? void 0 : gani.filename) + '...');
    const newGani = {
        data: gani.data,
        filename: 'interpolated_' + (gani === null || gani === void 0 ? void 0 : gani.filename),
        frames: new Map(),
        totalLength: gani.totalLength,
        looping: gani.looping
    };
    const dirCount = (_a = gani.frames.get(0)) === null || _a === void 0 ? void 0 : _a.directions.size;
    for (let i = 0; i < gani.frames.size - 1; i++) {
        const start = gani.frames.get(i);
        const end = gani.frames.get(i + 1);
        start.id = i * 3;
        newGani.frames.set(i * 3, start);
        let [nf1, nf2] = interpolateFrames(start, end);
        nf1.id = i * 3 + 1;
        nf2.id = i * 3 + 2;
        newGani.frames.set(i * 3 + 1, nf1);
        newGani.frames.set(i * 3 + 2, nf2);
    }
    const lastFrame = gani.frames.get(gani.frames.size - 1);
    lastFrame.id = newGani.frames.size;
    newGani.frames.set(newGani.frames.size, lastFrame);
    if (gani === null || gani === void 0 ? void 0 : gani.looping) {
        let [nf1, nf2] = interpolateFrames(lastFrame, gani.frames.get(0));
        nf1.id = lastFrame.id + 1;
        nf2.id = lastFrame.id + 2;
        newGani.frames.set(nf1.id, nf1);
        newGani.frames.set(nf2.id, nf2);
    }
    let totalLength = 0;
    for (const [, frame] of newGani.frames)
        totalLength += frame.delay;
    newGani.totalLength = totalLength;
    console.log(newGani.filename, newGani.frames.size);
    return newGani;
};
main();
