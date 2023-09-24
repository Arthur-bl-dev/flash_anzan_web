import { type AudioObjKey, type SoundExtension } from "../globals.js"
import { Howl, type HowlOptions } from "howler"
import { flashParamElements } from "../dom/flashParamElements.js"
import { initAudioBuffers } from "./playSound.js"
import { howler2OptionWav } from "../lib/howler2OptionWav.js"
import { howler2OptionOgg } from "../lib/howler2OptionOgg.js"
import { loadStatusManager } from "../loadStatusManager.js"

export function isMuted(): boolean {
    return flashParamElements.common.isMuted.valueV1
}

const howlStore: { [ext in SoundExtension]?: Howl | undefined } = {}

function getHowlOptions(ext: SoundExtension): HowlOptions {
    const optionMap: { [ext in SoundExtension]: HowlOptions } = {
        ogg: howler2OptionOgg,
        wav: howler2OptionWav,
    }
    const option = optionMap[ext]
    option.onload = () => {
        loadStatusManager.markAsLoaded("sound")
    }
    return option
}

function getHowl(extension: SoundExtension): Howl {
    if (howlStore[extension] === undefined) {
        loadStatusManager.resetSoundLoadedStatus()
        howlStore[extension] = new Howl(getHowlOptions(extension))
    }
    return howlStore[extension] as Howl
}

class AudioObj {
    private currentHowl: Howl | undefined

    load(extension: SoundExtension): void {
        this.currentHowl = getHowl(extension)
        void initAudioBuffers(extension, "beep")
        void initAudioBuffers(extension, "tick")
    }

    play(name: AudioObjKey): void {
        if (this.currentHowl === undefined) {
            throw new Error("audio is not initialized")
        }
        switch (name) {
            case "answer":
            case "correct":
            case "incorrect":
            case "silence":
                this.currentHowl.play(name)
                break
            default:
                throw new Error(`The sound "${name}" cannot play directly`)
        }
    }
}

export const audioObj = new AudioObj()