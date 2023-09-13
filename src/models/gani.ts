'use-strict'

namespace Models {

    export type Gani = {

        filename: string
        frames: Map<number, Frame>
        totalLength: number
        data: string[]
        looping: boolean

    } | null

    export type Frame = {

        id: number
        directions: Map<number, Map<number, Sprite>>
        delay: number
        sounds: Sound[]

    } | null

    export type Sprite = {

        spriteId: number
        x: number
        y: number

    }
    
    export type Sound = {

        filename: string
        x: number
        y: number

    }
}
