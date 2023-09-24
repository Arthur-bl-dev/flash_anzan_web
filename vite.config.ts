import { defineConfig } from "vite"
import * as path from "path"
import * as fs from "fs"
import { createHtmlPlugin } from "vite-plugin-html"

const appVersion = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + "/package.json")
    const body = JSON.parse(json.toString()) as { version: string }
    return `v${body.version}`
})()

const [appName, appDescription] = (() => {
    const json = fs.readFileSync(path.resolve(__dirname) + "/src/public/manifest.json")
    const body = JSON.parse(json.toString()) as { name: string, description: string }
    return [body.name, body.description]
})()

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    root: path.resolve(__dirname, "src"),
    base: "",
    build: {
        outDir: "../dist",
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].[hash].js",
                chunkFileNames: "assets/[name].[hash].js",
                assetFileNames: "assets/[name].[hash].[ext]",
            },
        },
    },
    define: {
        APP_CONFIG_FIRST_BEEP_TIMING: 500,
        APP_CONFIG_BEEP_INTERVAL: 875,
        APP_CONFIG_BEEP_COUNT: 2,
        APP_CONFIG_WAIT_SOUNDS_AND_FONTS_LOADED_TIMEOUT: 30000,
    },
    plugins: [
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: appName,
                    description: appDescription,
                    versionNumber: appVersion,
                },
            },
        }),
    ],
    css: {
        devSourcemap: true,
    },
    server: {
        port: 8080,
        watch: {
            usePolling: false,
        },
    },
})