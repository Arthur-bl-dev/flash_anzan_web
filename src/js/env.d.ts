// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// 「はじめる」ボタンを押してから音声とフォントが読み込まれるまでのタイムアウト時間
declare const APP_CONFIG_WAIT_SOUNDS_AND_FONTS_LOADED_TIMEOUT: number
