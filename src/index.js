// TODO: このファイルをクラス化して共通部分をまとめる
//  switch 文もまとめる

/* Global variables */

modeNames = {
    addition: "addition",
    multiplication: "multiplication",
};
param = {
    addition: {
        digit: {
            max: 14,
            min: 1,
            default: 1,
        },
        length: {
            max: 30,
            min: 2,
            default: 3,
        },
        time: {
            max: 30000,
            min: 1000,
            default: 5000,
        },
        flashRate: {
            max: 99,
            min: 1,
            default: 60,
        },
        offset: {
            max: 500,
            min: -500,
            default: 10,
        },
    },
    multiplication: {
        digit1: {
            max: 7,
            min: 1,
            default: 1,
        },
        digit2: {
            max: 7,
            min: 1,
            default: 1,
        },
        length: {
            max: 30,
            min: 2,
            default: 2,
        },
        time: {
            max: 30000,
            min: 1000,
            default: 5000,
        },
        flashRate: {
            max: 99,
            min: 1,
            default: 60,
        },
        offset: {
            max: 500,
            min: -500,
            default: 10,
        },
    }
};

answerTitle = document.getElementById("answer-title");
numberArea = document.getElementById("question-number-area");

button = {
    start: document.getElementById("start-button"),
    answer: document.getElementById("answer-button"),
    repeat: document.getElementById("repeat-button"),
    numberHistory: document.getElementById("number-history-button"),
    addition: document.getElementById("addition-button"),
    subtraction: document.getElementById("subtraction-button"),
    multiplication: document.getElementById("multiplication-button"),
};

disableConfigTarget = Array.from(document.getElementsByClassName("disable-config-target"));

resultSection = document.getElementById("result-section");
previousMode = document.getElementById("previous-mode");
answerNumber = document.getElementById("answer-number");
numberHistoryArea = document.getElementById("number-history-area");

sound = {
    directory: "./sound",
    extension: ".ogg",
}
soundUrl = {
    beep: sound.directory + "/beep" + sound.extension,
    tick: sound.directory + "/tick" + sound.extension,
    answer: sound.directory + "/answer" + sound.extension,
}

currentMode = document.getElementById("current-mode");

element = {
    addition: {
        digit: document.getElementById("addition-digit"),
        length: document.getElementById("addition-length"),
        time: document.getElementById("addition-time"),
        flashRate: document.getElementById("addition-flashRate"),
        offset: document.getElementById("addition-offset"),
    },
    multiplication: {
        digit1: document.getElementById("multiplication-digit-1"),
        digit2: document.getElementById("multiplication-digit-2"),
        length: document.getElementById("multiplication-length"),
        time: document.getElementById("multiplication-time"),
        flashRate: document.getElementById("multiplication-flashRate"),
        offset: document.getElementById("multiplication-offset"),
    },
};

multiplyFigure = "*";

numberHistoryDisplay = document.getElementById("number-history-display");
numberHistoryDisplayDelimiter = " → ";
numberHistoryString = document.getElementById("number-history-stringify");
numberHistoryStringifyDelimiter = "|";

function fixValue(limit, targetValue) {
    return Math.floor(Math.min(limit.max, Math.max(limit.min, targetValue)));
}

function increaseParam(id, amount) {
    const element = document.getElementById(id);
    if (element.disabled) {
        return;
    }

    const currentValue = Number(element.value);
    const paramName = id.split("-")[1];
    switch (paramName) {
        case "digit":
            if (currentMode.innerText === modeNames.multiplication) {
                element.value = fixValue(param[currentMode.innerText][paramName + id.split("-")[2]], Math.floor(currentValue) + amount).toString();
            } else if (currentMode.innerText === modeNames.addition) {
                element.value = fixValue(param[currentMode.innerText][paramName], Math.floor(currentValue) + amount).toString();
            }
            return;
        case "length":
            element.value = fixValue(param[currentMode.innerText][paramName], Math.floor(currentValue) + amount).toString();
            return;
        case "time":
            element.value = (fixValue(param[currentMode.innerText][paramName], currentValue * 1000 + amount) / 1000).toString();
            return;
        case "flashRate":
            element.value = fixValue(param[currentMode.innerText][paramName], currentValue + amount).toString();
            return;
    }
}

function setLimitAndDefaultValue() {
    Object.keys(element).map((mode) => {
        Object.keys(element[mode]).map((config) => {
            if (config === "time") {
                element[mode][config].max = param[mode][config].max / 1000;
                element[mode][config].min = param[mode][config].min / 1000;
                element[mode][config].value = param[mode][config].default / 1000;
                element[mode][config].step = param[mode][config].step / 1000;
            } else {
                element[mode][config].max = param[mode][config].max;
                element[mode][config].min = param[mode][config].min;
                element[mode][config].value = param[mode][config].default;
            }
        });
    });
    currentMode.innerText = modeNames.addition;
    changeMode(currentMode.innerText);
}

function changeMode(mode) {
    const buttonIdName = mode + '-button';
    const configIdName = mode + '-mode-config';
    const buttonTargetClassName = "btn-blue-active";
    const configTargetClassName = "display-none";
    const modeButtons = document.getElementById("mode-button-area").children;
    const configAreas = document.getElementById("mode-config-area").children;
    Array.from(modeButtons).map((element) => Array.from(element.classList).map((className) => {
        if (className === buttonTargetClassName) {
            element.classList.remove(className);
        }
    }));
    Array.from(configAreas).map((element) => element.classList.add(configTargetClassName));
    document.getElementById(buttonIdName).classList.add(buttonTargetClassName);
    document.getElementById(configIdName).classList.remove(configTargetClassName);
    changeShortcut(mode);
    currentMode.innerText = mode;
}

function flash(config = {}) {
    let requestParam = {
        digit: 0,
        length: 0,
        time: 0,
        flashRate: 0,
        offset: 0,
    };
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            requestParam.digit = [
                fixValue(param[currentMode.innerText].digit1, Math.floor(Number(element[currentMode.innerText].digit1.value))),
                fixValue(param[currentMode.innerText].digit2, Math.floor(Number(element[currentMode.innerText].digit2.value)))
            ];
            element[currentMode.innerText].digit1.value = requestParam.digit[0];
            element[currentMode.innerText].digit2.value = requestParam.digit[1];
            break;
        case modeNames.addition:
        default:
            requestParam.digit = fixValue(param[currentMode.innerText].digit, Math.floor(Number(element[currentMode.innerText].digit.value)));
            element[currentMode.innerText].digit.value = requestParam.digit;
    }
    requestParam.length = fixValue(param[currentMode.innerText].length, Math.floor(Number(element[currentMode.innerText].length.value)));
    requestParam.time = fixValue(param[currentMode.innerText].time, Number(element[currentMode.innerText].time.value) * 1000);
    requestParam.flashRate = fixValue(param[currentMode.innerText].flashRate, Number(element[currentMode.innerText].flashRate.value));
    requestParam.offset = fixValue(param[currentMode.innerText].offset, Number(element[currentMode.innerText].offset.value))
    element[currentMode.innerText].length.value = requestParam.length;
    element[currentMode.innerText].time.value = requestParam.time / 1000;
    element[currentMode.innerText].flashRate.value = requestParam.flashRate;
    element[currentMode.innerText].offset.value = requestParam.offset;

    function getFlashTime(length, time, flashRate) {
        const averageFlashTime = time / (length * 2);
        const flashOnTime = Number(averageFlashTime) * (flashRate / 50);
        const flashOffTime = Number(averageFlashTime) * ((100 - flashRate) / 50);
        return {on: flashOnTime, off: flashOffTime};
    }

    // 点灯時間と消灯時間を算出する
    const flashTime = getFlashTime(requestParam.length, requestParam.time, requestParam.flashRate);
    const flashOnTime = flashTime.on;
    const flashOffTime = flashTime.off;

    function generateNumbers(digit, length) {
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return min + Math.floor((max - min) * Math.random());
        }

        let numbers = [];
        for (let i = 0; i < length; ++i) {
            let min;
            let max;
            switch (currentMode.innerText) {
                case modeNames.multiplication:
                    min = [];
                    max = [];
                    min[0] = Math.pow(10, digit[0] - 1);
                    max[0] = Math.pow(10, digit[0]) - 1;
                    min[1] = Math.pow(10, digit[1] - 1);
                    max[1] = Math.pow(10, digit[1]) - 1;
                    numbers.push([getRandomInt(min[0], max[0]), getRandomInt(min[1], max[1])]);
                    break;
                case modeNames.addition:
                default:
                    min = Math.pow(10, digit - 1);
                    max = Math.pow(10, digit) - 1;
                    numbers.push(getRandomInt(min, max));
            }
        }
        return numbers;
    }

    function generateToggleNumberSuite(numbers) {
        let toggleNumberSuite = [];
        for (let i = 0; i < numbers.length; i++) {
            toggleNumberSuite.push(numbers[i]);
            toggleNumberSuite.push("");
        }
        return toggleNumberSuite;
    }

    function generateSounds() {
        let sounds = [];
        for (let i = 0; i < requestParam.length; ++i) {
            const tickSound = new Audio(soundUrl.tick);
            tickSound.load();
            sounds.push(tickSound);
            sounds.push(new Audio());
        }
        return sounds;
    }


    let numbers;
    let numberHistory = numberHistoryString.innerText.split(numberHistoryStringifyDelimiter);
    let digitIsSame;
    const arrayDelimiter = ",";
    const firstNumberHistory = numberHistory[0];
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            const splitFirstNumberHistory = firstNumberHistory.split(arrayDelimiter);
            if (!splitFirstNumberHistory[1]) {
                digitIsSame = false;
                break;
            }
            digitIsSame =
                requestParam.digit[0] === splitFirstNumberHistory[0].length
                && requestParam.digit[1] === splitFirstNumberHistory[1].length;
            numberHistory = numberHistory.map((p) => p.split(arrayDelimiter).map((n) => Number(n)));
            break;
        case modeNames.addition:
        default:
            digitIsSame = requestParam.digit === firstNumberHistory.length;
            numberHistory = numberHistory.map((n) => Number(n));
    }
    if (config.repeat && digitIsSame) {
        if (requestParam.length === numberHistory.length) {
            numbers = numberHistory;
        } else if (requestParam.length < numberHistory.length) {
            numbers = numberHistory.slice(0, requestParam.length);
        } else {
            numbers = numberHistory.concat(generateNumbers(requestParam.digit, requestParam.length - numberHistory.length));
        }
    } else {
        numbers = generateNumbers(requestParam.digit, requestParam.length);
    }
    let localeStringNumbers;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            localeStringNumbers = numbers.map((p) => p[0].toLocaleString() + multiplyFigure + p[1].toLocaleString());
            break;
        case modeNames.addition:
        default:
            localeStringNumbers = numbers.map((n) => n.toLocaleString());
    }
    const toggleNumberSuite = generateToggleNumberSuite(localeStringNumbers);
    const soundSuite = generateSounds();

    let toggleNumberFunctions = [];
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        toggleNumberFunctions.push(() => {
            numberArea.innerText = toggleNumberSuite[i];
        });
    }

    const playTickFunctions = [];
    for (let i = 0; i < soundSuite.length; i++) {
        playTickFunctions.push(() => {
            soundSuite[i].play();
        });
    }

    const flashTimes = [];
    for (let i = 0; i < soundSuite.length; i++) {
        if (i % 2 === 0) {
            flashTimes.push(flashOnTime);
        } else {
            flashTimes.push(flashOffTime);
        }
    }

    function disableButtons() {
        button.start.disabled = true;
        button.repeat.disabled = true;
        button.answer.disabled = true;
        disableConfigTarget.map((element) => element.disabled = true);
    }

    function enableButtons() {
        button.repeat.disabled = false;
        button.answer.disabled = false;
    }

    let playBeepFunctions = [];
    for (let i = 0; i < 2; i++) {
        const beep = new Audio(soundUrl.beep);
        beep.load();
        playBeepFunctions.push(() => {
            beep.play().then(r => r);
        });
    }

    answerTitle.style.display = "none";
    numberArea.innerText = "";
    resultSection.style.display = "none";
    numberHistoryArea.style.display = "none";
    previousMode.innerText = currentMode.innerText;
    switch (currentMode.innerText) {
        case modeNames.multiplication:
            answerNumber.innerText = numbers.reduce((a, b) => (a[1] ? a[0] * a[1] : a) + b[0] * b[1]).toLocaleString();
            break;
        case modeNames.addition:
        default:
            answerNumber.innerText = numbers.reduce((a, b) => a + b).toLocaleString();
    }
    numberHistoryDisplay.innerText = localeStringNumbers.join(numberHistoryDisplayDelimiter);
    numberHistoryString.innerText = numbers.join(numberHistoryStringifyDelimiter);

    // Register flash events
    const beforeBeepTime = 500;
    const beepInterval = 875;
    const flashStartTiming = beforeBeepTime + beepInterval * 2;
    setTimeout(disableButtons, 0);
    setTimeout(playBeepFunctions[0], beforeBeepTime - requestParam.offset);
    setTimeout(playBeepFunctions[1], beforeBeepTime + beepInterval - requestParam.offset);
    let toggleTiming = flashStartTiming;
    for (let i = 0; i < toggleNumberSuite.length; i++) {
        setTimeout(playTickFunctions[i], toggleTiming - requestParam.offset);
        setTimeout(toggleNumberFunctions[i], toggleTiming);
        toggleTiming += flashTimes[i];
    }
    setTimeout(enableButtons, toggleTiming);
}

function displayAnswer() {
    button.answer.disabled = true;
    button.repeat.disabled = true;
    new Audio(soundUrl.answer).play().then(r => r);

    setTimeout(() => {
        answerTitle.style.display = "block";
        numberArea.innerText = answerNumber.innerText;

        button.start.disabled = false;
        button.repeat.disabled = false;
        disableConfigTarget.map((element) => element.disabled = false);

        button.numberHistory.disabled = false;
        resultSection.style.display = "block";
    }, 1500);
}

function displayNumberHistoryArea() {
    button.numberHistory.disabled = true;
    numberHistoryArea.style.display = "block";
}

function changeShortcut(mode) {
    ["y", "h", "u", "j", "i", "k", "o", "l", "shift+o", "shift+l", "p", "shift+p"].map((key) => {
        shortcut.remove(key);
    });
    switch (mode) {
        case modeNames.multiplication:
            shortcut.add("y", () => increaseParam(mode + "-digit-1", 1));
            shortcut.add("h", () => increaseParam(mode + "-digit-1", -1));
            shortcut.add("u", () => increaseParam(mode + "-digit-2", 1));
            shortcut.add("j", () => increaseParam(mode + "-digit-2", -1));
            break;
        case modeNames.addition:
        default:
            shortcut.add("u", () => increaseParam(mode + "-digit", 1));
            shortcut.add("j", () => increaseParam(mode + "-digit", -1));
    }
    shortcut.add("i", () => increaseParam(mode + "-length", 1));
    shortcut.add("k", () => increaseParam(mode + "-length", -1));
    shortcut.add("o", () => increaseParam(mode + "-time", 1000));
    shortcut.add("l", () => increaseParam(mode + "-time", -1000));
    shortcut.add("shift+o", () => increaseParam(mode + "-time", 100));
    shortcut.add("shift+l", () => increaseParam(mode + "-time", -100));
    shortcut.add("p", () => increaseParam(mode + "-flashRate", 1));
    shortcut.add("shift+p", () => increaseParam(mode + "-flashRate", -1));
}

(() => {
    // 先に音源を読み込む経験を積めば，ページ表示後最初から快適にプレイできるかもしれない．
    setTimeout(() => new Audio(soundUrl.beep).load(), 100);
    setTimeout(() => new Audio(soundUrl.tick).load(), 200);
    setTimeout(() => new Audio(soundUrl.answer).load(), 300);

    // フォントの読み込みに時間がかかるため，ウォーミングアップで 1 回見えない文字を光らせておく
    const currentNumberColor = numberArea.style.color;
    setTimeout(() => numberArea.style.color = "black", 400);
    setTimeout(() => numberArea.innerText = "0", 500);
    setTimeout(() => numberArea.innerText = "", 600);
    setTimeout(() => numberArea.style.color = currentNumberColor, 700);

    setTimeout(setLimitAndDefaultValue, 800);
    setTimeout(() => {
        button.start.disabled = false;
    }, 900);

    // Register Shortcuts
    shortcut.add("s", () => button.start.click());
    shortcut.add("a", () => button.answer.click());
    shortcut.add("r", () => button.repeat.click());

    shortcut.add("z", () => button.addition.click());
    shortcut.add("x", () => button.subtraction.click());
    shortcut.add("c", () => button.multiplication.click());

    shortcut.add("n", () => button.numberHistory.click());
})();
