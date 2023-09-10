/* Global variables */

import {getHtmlElement} from "./htmlElement";
import {
    FlashDifficultyParam,
    FlashIsMutedParam,
    FlashNumberParam,
    FlashSoundExtensionParam,
    FlashTimeParam
} from "./flashParams";

export const flashModes = ['addition', 'multiplication'] as const;
export type FlashMode = typeof flashModes[number];

export type FlashDigit = {
    addition: number,
    multiplication: [number, number],
}

export const modeNames: { [key in FlashMode]: Lowercase<key> } = {
    addition: "addition",
    multiplication: "multiplication",
};

export type ComplexityThresholdMapKey = {
    addition: `${number}-${number}`
    multiplication: `${number}-${number}-${number}`
}

export type ComplexityThreshold = {
    med: number
    hard: number
    easy: number
}

export type Complexity = ComplexityThreshold["easy" | "hard"]

export type ComplexityThresholdMapByMode<T extends FlashMode> = {
    [key in ComplexityThresholdMapKey[T]]: ComplexityThreshold
}

export type ComplexityThresholdMap = { [key in FlashMode]: ComplexityThresholdMapByMode<key> }

export const flashDifficulty = ['easy', 'normal', 'hard'] as const;
export type FlashDifficulty = typeof flashDifficulty[number]

export const audioAttr = {
    directory: "./sounds",
};

export const headerMessage = getHtmlElement("div", "header-message");
export const questionNumberArea = getHtmlElement("div", "question-number-area");
export const calculateArea = getHtmlElement("div", "calculate-area");
export const inputAnswerBox = getHtmlElement("input", "input-answer-box");
export const inputAnswerBoxTouchDisplay = getHtmlElement("input", "input-answer-box-touch-display");
export const inputAnswerBoxTouchActual = getHtmlElement("input", "input-answer-box-touch-actual");
export const noticeArea = getHtmlElement("p", "notice-area");
export const versionNumber = getHtmlElement("span", "version-number")

export const button = {
    loadParams: getHtmlElement("button", "load-params-button"),
    doLoadParams: getHtmlElement("button", "do-load-params"),
    saveParams: getHtmlElement("button", "save-params-button"),
    doSaveParams: getHtmlElement("button", "do-save-params"),
    deleteParams: getHtmlElement("button", "delete-params-button"),
    doDeleteParams: getHtmlElement("button", "do-delete-params"),
    start: getHtmlElement("button", "start-button"),
    repeat: getHtmlElement("button", "repeat-button"),
    numberHistory: getHtmlElement("button", "number-history-button"),
    addition: getHtmlElement("a", "pills-addition-tab"),
    subtraction: getHtmlElement("a", "pills-subtraction-tab"),
    multiplication: getHtmlElement("a", "pills-multiplication-tab"),
    closeInputAnswer: getHtmlElement("button", 'closeInputAnswerModal'),
    help: getHtmlElement("button", 'help-button'),
    openCommonMoreConfig: getHtmlElement("button", 'open-common-more-config-button'),
    difficulty: {
        easy: getHtmlElement("input", 'difficulty-easy'),
        normal: getHtmlElement("input", 'difficulty-normal'),
        hard: getHtmlElement("input", 'difficulty-hard'),
    },
    isMuted: getHtmlElement("input", "is-muted-button"),
};

export const flashParamElements = {
    addition: {
        digit: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "addition-digit"),
            schema: {min: 1, max: 14, default: 1},
        }),
        length: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "addition-length"),
            schema: {min: 2, max: 30, default: 3},
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "addition-time"),
            schema: {min: 1000, max: 30000, default: 5000},
        }),
    },
    multiplication: {
        digit1: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-digit-1"),
            schema: {min: 1, max: 7, default: 1},
        }),
        digit2: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-digit-2"),
            schema: {min: 1, max: 7, default: 1},
        }),
        length: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "multiplication-length"),
            schema: {min: 2, max: 30, default: 2},
        }),
        time: new FlashTimeParam({
            htmlElement: getHtmlElement("input", "multiplication-time"),
            schema: {min: 1000, max: 30000, default: 5000},
        }),
    },
    common: {
        difficulty: new FlashDifficultyParam({
            htmlElement: getHtmlElement("select", "difficulty"),
            schema: {default: 'easy'},
        }),
        flashRate: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-flashRate"),
            schema: {min: 1, max: 99, default: 55},
        }),
        offset: new FlashNumberParam({
            htmlElement: getHtmlElement("input", "common-offset"),
            schema: {min: -500, max: 500, default: 0},
        }),
        isMuted: new FlashIsMutedParam({
            htmlElement: getHtmlElement("input", "is-muted"),
            schema: {default: false},
            options: {
                buttonElement: button.isMuted,
                audioStatusElement: getHtmlElement("label", "audio-status"),
            },
        }),
        soundExtension: new FlashSoundExtensionParam({
            htmlElement: getHtmlElement("select", "sound-extension"),
            schema: {default: 'wav'},
        }),
    },
};

export const disableConfigTarget = [
    button.start,
    button.repeat,
    button.loadParams,
    button.saveParams,
    button.deleteParams,
];

export const multiplyFigure = "*";

export const switchInputAnswerBoxTab = {
    touchTab: getHtmlElement("button", "switchInputAnswerBoxTab-touch-tab"),
    keyboardTab: getHtmlElement("button", "switchInputAnswerBoxTab-keyboard-tab"),
}
export const noticeInputAnswerNonTouchDevice = getHtmlElement("span", "notice-input-answer-non-touch-device")
export const numberHistoryDisplay = getHtmlElement("td", "number-history-display");
export const answerNumberDisplay = getHtmlElement("td", "answer-number-display");

export const savedParamsKeyName = "flash_anzan_params";

export const modals = {
    welcome: getHtmlElement("div", "welcomeModal"),
    params: {
        load: {
            confirm: getHtmlElement("div", "loadParamsConfirmModal"),
            complete: getHtmlElement("div", "loadParamsCompletedModal"),
        },
        save: {
            confirm: getHtmlElement("div", "saveParamsConfirmModal"),
            complete: getHtmlElement("div", "saveParamsCompletedModal"),
        },
        delete: {
            confirm: getHtmlElement("div", "deleteParamsConfirmModal"),
            complete: getHtmlElement("div", "deleteParamsCompletedModal"),
        },
    },
    input_answer: getHtmlElement("div", "inputAnswerModal"),
};

// 10 % の確率を連続で外す確率が 5000 分の 1 以下となる最小の回数
export const generateNumbersRetryLimit = 81;
// console.log(((n: number) => {
//     const threshold = 0.02
//     return Math.pow(0.9, n - 1) * 100 > threshold
//         && Math.pow(0.9, n) * 100 <= threshold
// })(generateNumbersRetryLimit))
