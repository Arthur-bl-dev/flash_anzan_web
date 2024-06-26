import '../scss/styles.scss'
import * as bootstrap from 'bootstrap'
import { SimpleKeyboard } from 'simple-keyboard'
import { type FlashAnswer } from './flash/flashNumbers.js'
import { getTime } from './time.js'
import { currentFlashMode } from './currentFlashMode.js'
import { disableHtmlButtons, enableHtmlButtons, isFullscreen, isTouchDevice, setFullscreenMode } from './screen.js'
import { audioObj } from './sound/sound.js'
import { changeMode } from './flash/flashParamSet.js'
import { registerShortcuts } from './shortcut/shortcut.js'
import { type FlashOptions, getFlashQuestionCreator } from './flash/flashQuestionCreator.js'
import {
    answerNumberDisplay,
    button,
    calculateArea,
    checkboxes,
    headerMessage,
    htmlElements,
    inputAnswerBox,
    inputAnswerBoxTouchActual,
    inputAnswerBoxTouchDisplay,
    modals,
    noticeArea,
    noticeInputAnswerNonTouchDevice,
    numberHistoryDisplay,
    questionNumberArea,
    switchInputAnswerBoxTab,
    tooltips,
} from './dom/htmlElement.js'
import { latestFlashNumberHistory } from './flash/flashNumberHistory.js'
import { getFlashSuite } from './flash/flashSuite.js'
import { measuredTime } from './flash/measuredTime.js'
import { type AudioObjKey } from './globals.js'
import { waitLoaded } from './loadStatusManager.js'
import {
    doLoadEnvironmentParams,
    doLoadParams,
    doSaveEnvironmentParams,
    doSaveParams,
} from './flash/flashParamStorage.js'
import { isMutedConfig } from './sound/isMutedConfig.js'
import { flashParamSchema } from '../config/flashParamSchema.js'
import { Browser } from '@capacitor/browser'
import { checkMobileAppUpdate } from './mobile.js'

interface SetFlashTimeOutHandle {
    value?: number
}

async function flash(options: FlashOptions = {}): Promise<void> {
    doSaveEnvironmentParams() // 環境設定はプレイごとに保存する
    doSaveParams() // 出題設定はプレイごとに保存する
    measuredTime.reset()

    /**
     * 答え入力のための準備的な。
     * @param {FlashAnswer} answer
     * @param offset
     */
    const getPrepareAnswerInputFunc = (answer: FlashAnswer, offset: number): (() => void) => {
        /**
         * 答えを表示する
         * @param {string} numberStr 答えの数字
         * @param {FlashAnswer} answer
         * @param offset
         */
        function displayResult(numberStr: string, answer: FlashAnswer, offset: number): void {
            const headerMessageInnerText1 =
                numberStr !== '' ? 'Minha resposta: ' + Number(numberStr).toLocaleString() : 'Minha resposta: '
            const isCorrect = numberStr === answer.toString()
            const resultAudioObj: AudioObjKey = isCorrect ? 'correct' : 'incorrect'
            const headerMessageInnerText2: string = isCorrect
                ? `Correto！（${headerMessageInnerText1}）`
                : `"Resposta incorreta."...（${headerMessageInnerText1}）`
            const questionNumberAreaInnerHTML = !checkboxes.hideAnswer.checked
                ? answer.toDisplay()
                : isCorrect
                ? '<span class="bi-emoji-smile-fill text-success"></span>'
                : '<span class="bi-emoji-frown-fill text-danger"></span>'

            const timeToDisplay = 1200

            setTimeout(() => {
                audioObj.play('answer')
            }, 0)
            setTimeout(() => {
                headerMessage.innerText = headerMessageInnerText1
                button.repeat.disabled = true
            }, offset)

            setTimeout(() => {
                audioObj.play(resultAudioObj)
            }, timeToDisplay)
            setTimeout(() => {
                headerMessage.innerText = headerMessageInnerText2
                questionNumberArea.innerHTML = questionNumberAreaInnerHTML

                enableHtmlButtons()
                button.numberHistory.disabled = false
                if (!isFullscreen()) {
                    return
                }
                if (isTouchDevice()) {
                    // タッチデバイス
                    calculateArea.addEventListener(
                        'touchend',
                        (event) => {
                            event.preventDefault()
                            setFullscreenMode(false)
                        },
                        { once: true }
                    )
                    noticeArea.innerText = 'Toque na tela para voltar.'
                } else {
                    // 非タッチデバイス
                    noticeArea.innerText = 'Pressione a tecla W para voltar.'
                }
            }, timeToDisplay + offset)
        }

        return () => {
            inputAnswerBox.value = ''
            {
                const flashElapsedTimeMs = Math.floor(measuredTime.end - measuredTime.start)
                const afterDecimalPointStr = ('00' + String(flashElapsedTimeMs % 1000)).slice(-3)
                const beforeDecimalPointStr = String(Math.floor(flashElapsedTimeMs / 1000))
                headerMessage.innerText = `Medição em tempo real: ${beforeDecimalPointStr}.${afterDecimalPointStr} Segundos (do início da exibição do primeiro número até o último número desaparecer)`
            }

            // モーダル表示時のイベント設定
            const listener = isTouchDevice()
                ? () => {
                      const modalFooter: HTMLDivElement | null = modals.input_answer.querySelector('.modal-footer')
                      if (modalFooter === null) {
                          throw new Error('element not found: modal footer')
                      }
                      modalFooter.style.display = 'none'
                      switchInputAnswerBoxTab.touchTab.click()
                      noticeInputAnswerNonTouchDevice.style.display = 'none'
                  }
                : () => {
                      clearInputAnswerBox()
                      switchInputAnswerBoxTab.keyboardTab.click()
                      inputAnswerBox.focus()
                      noticeInputAnswerNonTouchDevice.style.display = 'block'
                  }
            modals.input_answer.addEventListener('shown.bs.modal', listener)

            const modal = new bootstrap.Modal(modals.input_answer, {
                backdrop: false,
                keyboard: false,
                focus: true,
            })

            // 回答送信時のイベント設定
            if (isTouchDevice()) {
                const btnSendAnswer: HTMLButtonElement | null = document.querySelector(
                    '#input-answer-box-area-touch .btn-send-answer'
                )
                if (btnSendAnswer === null) {
                    throw new Error('element not found: btn send answer')
                }
                btnSendAnswer.addEventListener(
                    'click',
                    () => {
                        displayResult(inputAnswerBoxTouchActual.value, answer, offset)
                        modal.hide()
                    },
                    { once: true }
                )
            } else {
                const listener = () => {
                    return (event: KeyboardEvent) => {
                        if (
                            document.activeElement?.id === 'input-answer-box' &&
                            String(event.key).toLowerCase() === 'enter'
                        ) {
                            displayResult(inputAnswerBox.value, answer, offset)
                            modal.hide()
                            return
                        }
                        document.addEventListener('keydown', listener(), { once: true })
                    }
                }
                document.addEventListener('keydown', listener(), { once: true })
            }

            modal.show()
        }
    }

    // ここからフラッシュ出題の処理
    const flashQuestionCreator = getFlashQuestionCreator(currentFlashMode.value)

    // 出題するフラッシュ
    const question = flashQuestionCreator.create(options)

    // フラッシュ音声と表示タイミング
    const flashSuite = await getFlashSuite({
        paramSet: question.paramSet,
        prepareAnswerInputFunc: getPrepareAnswerInputFunc(question.flash.answer, question.paramSet.offset),
        numbersToDisplay: question.flash.numbers.toDisplay(),
    })

    // 答えと出題数字履歴を作成する
    headerMessage.innerText = ''
    questionNumberArea.innerText = ''
    button.numberHistory.disabled = true

    const start = getTime()

    function setFlashTimeOut(fn: () => void, delay: number): SetFlashTimeOutHandle {
        const handle: SetFlashTimeOutHandle = {}

        function loop(): void {
            const current = getTime()
            const delta = current - start
            if (delta >= delay) {
                fn()
            } else {
                handle.value = requestAnimationFrame(loop)
            }
        }

        handle.value = requestAnimationFrame(loop)
        return handle
    }

    // Register flash events
    disableHtmlButtons()
    setFullscreenMode(true)
    noticeArea.innerText = ''
    for (const flashSuiteElement of flashSuite) {
        setFlashTimeOut(flashSuiteElement.fn, flashSuiteElement.delay)
    }
}

function clearInputAnswerBox(): void {
    inputAnswerBox.value = ''
    inputAnswerBoxTouchDisplay.value = ''
    inputAnswerBoxTouchActual.value = ''
}

function hideOpenAppPageButton(): void {
    if (import.meta.env.MODE !== 'mobile') {
        button.openAppPage.classList.add('d-none')
        return
    }

    const url = import.meta.env.VITE_APP_STORE_URL
    if (url === undefined) {
        throw Error('app store url is not defined')
    }
    button.openAppPage.addEventListener('touchend', () => {
        void Browser.open({ url })
    })
}

void (async () => {
    const setup = async (): Promise<void> => {
        const waitLoadedPromise = waitLoaded(APP_CONFIG_WAIT_SOUNDS_AND_FONTS_LOADED_TIMEOUT)

        isMutedConfig.isMuted = checkboxes.isMuted.checked
        audioObj.load(htmlElements.soundExtension.value)
        // eslint-disable-next-line no-new
        new bootstrap.Tooltip(tooltips.configOffset)

        // ページ読み込み時処理
        ;(() => {
            doLoadEnvironmentParams()
            doLoadParams()
            changeMode('addition')
            registerShortcuts()
            hideOpenAppPageButton()
        })()

        // タッチデバイスの回答入力
        ;(() => {
            function updateInput(value: string): void {
                const actualValue = value
                    .trim()
                    .replace(/^0+$/, '0')
                    .replace(/^0+([1-9]+)$/, '$1')
                inputAnswerBoxTouchActual.value = actualValue
                inputAnswerBoxTouchDisplay.value = actualValue
                    .split('')
                    .reverse()
                    .map((digit, i) => {
                        return i > 0 && i % 3 === 0 ? `${digit},` : digit
                    })
                    .reverse()
                    .join('')
            }

            function clearInput(): void {
                inputAnswerKeyboard.clearInput()
                updateInput('')
            }

            Array.from(document.getElementsByClassName('btn-clear-input-answer-box')).forEach((element) => {
                element.addEventListener('click', clearInput)
            })
            modals.input_answer.addEventListener('show.bs.modal', clearInput)

            const inputAnswerKeyboard = new SimpleKeyboard('.input-answer-keyboard-touch', {
                onChange: (value) => {
                    updateInput(value)
                },
                layout: {
                    default: ['7 8 9', '4 5 6', '1 2 3', ' 0 '],
                },
            })
        })()

        // 回答入力タブ切り替え動作イベントを登録
        ;(() => {
            const triggerTabs: Element[] = [].slice.call(document.querySelectorAll('#switchInputAnswerBoxTab button'))
            triggerTabs.forEach((element) => {
                const tabTrigger = new bootstrap.Tab(element)
                element.addEventListener('click', (event) => {
                    event.preventDefault()
                    tabTrigger.show()
                })
            })
        })()

        // set onclick events in index.html
        ;(() => {
            // フラッシュ操作
            button.start.addEventListener('click', () => {
                void flash()
            })
            button.repeat.addEventListener('click', () => {
                void flash({ repeat: true })
            })

            // モード切り替え
            button.addition.addEventListener('click', () => {
                changeMode('addition')
            })
            // button.subtraction.addEventListener('click', () => changeMode(modeNames.subtraction))
            button.multiplication.addEventListener('click', () => {
                changeMode('multiplication')
            })

            // 出題履歴表示
            button.numberHistory.addEventListener('click', () => {
                const latestHistory = latestFlashNumberHistory.history
                if (latestHistory === null) {
                    return
                }
                numberHistoryDisplay.innerHTML = latestHistory.numberHistory.toDisplay().join('<br>')
                answerNumberDisplay.innerText = latestHistory.answer.toDisplay()
                new bootstrap.Modal(modals.number_history).show()
            })
        })()

        // フラッシュ出題エリアの選択を禁止する
        calculateArea.addEventListener('selectstart', (event) => {
            event.preventDefault()
        })

        await waitLoadedPromise
    }

    // autoload
    await (async () => {
        await checkMobileAppUpdate()
        ;(() => {
            // default value
            checkboxes.isMuted.checked = flashParamSchema.common.isMuted.default
            htmlElements.soundExtension.value = flashParamSchema.common.soundExtension.default
            checkboxes.fixNumberInterval.checked = flashParamSchema.common.fixNumberInterval.default
            checkboxes.hideAnswer.checked = flashParamSchema.common.hideAnswer.default
            if (isTouchDevice()) {
                button.help.style.display = 'none'
            }
        })()
        ;(() => {
            // setup welcome modal
            const button = document.querySelector<HTMLButtonElement>('#welcomeModal .modal-footer > button')
            if (button == null) {
                throw new Error('element not found: modal footer button')
            }
            const spinner = button.querySelector<HTMLSpanElement>('.spinner-border')
            if (spinner === null) {
                throw new Error('element not found: button spinner')
            }
            const text = button.querySelector<HTMLSpanElement>('.button-text')
            if (text === null) {
                throw new Error('element not found: button text')
            }
            const welcomeModal = new bootstrap.Modal(modals.welcome, {
                backdrop: 'static',
                keyboard: false,
                focus: true,
            })

            button.addEventListener('click', () => {
                button.disabled = true
                // keep button width
                button.style.width = getComputedStyle(button).width
                spinner.classList.remove('d-none')
                text.classList.add('d-none')
                setup()
                    .then((_) => {
                        welcomeModal.hide()
                    })
                    .catch((_) => {
                        alert('Erro ao carregar a fonte ou o áudio.')
                        if (confirm('Você gostaria de carregar novamente?')) {
                            location.reload()
                        }
                    })
            })
            welcomeModal.show()
        })()
    })()
})()
