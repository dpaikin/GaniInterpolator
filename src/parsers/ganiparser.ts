
import fs from 'fs'
import readline from 'readline-sync'

type ParseMode = 'frame' | 'data' | null

export const parseGani = (filename: string): Models.Gani => {
            
    const frames = new Map<number, Models.Frame>()

    const fileContent = fs.readFileSync(`./input/${filename}`, 'utf-8');
    const lines = fileContent.split('\n');

    let parseMode: ParseMode = 'data'
    let currentFrame: Models.Frame = null

    let currentFrameCount = 0

    let looping = false

    const nextFrame = () => {
        parseMode = 'frame'
        currentFrame = {
            delay: 1,
            directions: new Map<number, Map<number, Models.Sprite>>,
            id: currentFrameCount,
            sounds: []
        }
    }

    const data = []

    for (const line of lines) {

        if (line.startsWith('LOOP'))
            looping = true

        if (line.startsWith('ANIEND'))
            break

        if (line.startsWith('ANI')) {
            nextFrame()
            currentFrameCount++
            continue
        }

        if (parseMode == 'data') {
            data.push(line)
            continue
        }

        if (line.trim() == '' && parseMode == 'frame') {
            frames.set(currentFrameCount - 1, currentFrame)
            nextFrame()
            currentFrameCount++
            continue
        }

        if (line.trim() == '')
            continue

        if (line.startsWith('PLAYSOUND') && parseMode == 'frame') {
            const split = line.split(' ')
            currentFrame!.sounds.push({
                filename: split[1],
                x: parseFloat(split[2]),
                y: parseFloat(split[3])
            })
            continue
        }

        if (parseMode == 'frame') {
            if (line.startsWith('WAIT')) {
                const delay = parseFloat(line.split(' ')[1])
                currentFrame!.delay = delay + 1
                continue
            }
            const spritesSplit = line.split(',')
            const sprites = new Map<number, Models.Sprite>()
            let spriteCount = 0
            for (const spriteSplit of spritesSplit) {
                const spriteDetailsSplit = spriteSplit.split(/(\s+)/).filter( e => e.trim().length > 0)
                const sprite: Models.Sprite = {
                    spriteId: parseInt(spriteDetailsSplit[0]),
                    x: parseInt(spriteDetailsSplit[1]),
                    y: parseInt(spriteDetailsSplit[2])
                }
                sprites.set(spriteCount++, sprite)
            }
            const currentDir = currentFrame!.directions.size
            currentFrame!.directions.set(currentDir, sprites)
        }
        
    }

    let totalLength = 0
    for (const [, frame] of frames)
        totalLength += frame!.delay

    return {
        data: data,
        filename: filename,
        frames: frames,
        totalLength: totalLength,
        looping: looping
    }

}

export const saveGani = (gani: Models.Gani): void => {

    console.log('Saving ' + gani?.filename)

    let lines = gani!.data

    lines = lines.map(l => l + '\n')

    lines.push('ANI\r\n')

    for (const [id, frame] of gani!.frames.entries()) {
        for (const [dir, sprites] of frame!.directions) {
            let currentLine = '  '
            for (let [i, sprite] of sprites.entries()) {
                if (i != 0)
                    currentLine += '   '
                currentLine += sprite.spriteId + '   ' + sprite.x + '   ' + sprite.y + ','
            }
            currentLine = currentLine.substring(0, currentLine.length - 1)
            lines.push(currentLine + '\r\n')
        }
        for (const sound of frame!.sounds)
            lines.push('PLAYSOUND ' + sound.filename + ' ' + sound.x + ' ' + sound.y + '\r\n')
        if (frame?.delay != 1)
            lines.push('WAIT ' + (frame!.delay - 1) + '\r\n')
        lines.push('\r\n')
    }

    lines.push('ANIEND')

    fs.writeFileSync('./output/' + gani?.filename, lines.join(''))

}