const numberToImage = {
    1: 'static/images/1.png',
    2: 'static/images/2.png',
    3: 'static/images/3.png',
    4: 'static/images/4.png',
    5: 'static/images/5.png',
    6: 'static/images/6.png',
    7: 'static/images/7.png',
    8: 'static/images/8.png',
    9: 'static/images/9.png',
};


document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});


const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');

const cells = document.querySelectorAll('.main-grid-cell');

const name_input = document.querySelector('#input-name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');
const game_score = document.querySelector('#game-score');

const result_time = document.querySelector('#result-time');
const result_score = document.querySelector('#result-score');

let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;
let score = 0;

let isNewGame = true;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

const initGameGrid = () => {
    let index = 0;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';

        index++;
    }
}

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    console.log("Clearing Sudoku grid...");
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled', 'selected', 'err', 'hover');
        cells[i].style.backgroundImage = '';
    }
};


const initSudoku = () => {
    clearSudoku();
    resetBg();
    su = sudokuGen(level);
    su_answer = [...su.question];

    seconds = 0;

    saveGameInfo();


    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            const number = su.question[row][col];
            const img = document.createElement('img');
            img.src = numberToImage[number];
            cells[i].appendChild(img);
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();

    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];
    su = game.su;
    su_answer = su.answer;
    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);
    level_index = game.level;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;

        cells[i].setAttribute('data-value', su_answer[row][col]);

        if (su_answer[row][col] !== 0) {
            const imageUrl = numberToImage[su_answer[row][col]];
            cells[i].style.backgroundImage = `url('${imageUrl}')`;
            cells[i].style.backgroundSize = "cover";
            cells[i].innerHTML = '';
        } else {
            cells[i].style.backgroundImage = '';
            cells[i].innerHTML = '';
        }
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}


const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
     while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout(() => {
                cell.classList.remove('cell-err');
            }, 500);
        }
    };

    let index = selected_cell;
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    let incorrect = false;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            if (!cell.classList.contains('selected') && parseInt(cell.getAttribute('data-value')) === value) {
                incorrect = true;
                addErr(cell);
            }
        }
    }

    let step = 9;
    while (index - step >= 0) {
        if (parseInt(cells[index - step].getAttribute('data-value')) === value) {
            incorrect = true;
            addErr(cells[index - step]);
        }
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        if (parseInt(cells[index + step].getAttribute('data-value')) === value) {
            incorrect = true;
            addErr(cells[index + step]);
        }
        step += 9;
    }

    step = 1;
    while (index - step >= 9 * row) {
        if (parseInt(cells[index - step].getAttribute('data-value')) === value) {
            incorrect = true;
            addErr(cells[index - step]);
        }
        step += 1;
    }

    step = 1;
    while (index + step < 9 * row + 9) {
        if (parseInt(cells[index + step].getAttribute('data-value')) === value) {
            incorrect = true;
            addErr(cells[index + step]);
        }
        step += 1;
    }

    if (incorrect) {
        score -= 5;
    } else {
        score += 10;
    }
    updateScore();

}

const updateScore = () => {
    const game_score = document.querySelector('#game-score');
    game_score.innerHTML = score;
    return score;
};

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        score: score,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    document.querySelector('#btn-continue').style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
    clearInterval(timer);
    result_screen.classList.add('active');
    
    result_time.innerHTML = showTime(seconds);

    const finalScore = updateScore();
    result_score.innerHTML = `${finalScore}`;
};

const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell].classList.contains('fille d')) {

                cells[selected_cell].innerHTML = ''; 
                cells[selected_cell].setAttribute('data-value', index + 1);

                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;

                const img = document.createElement('img');
                img.src = numberToImage[index + 1];
                img.alt = `Number ${index + 1}`;
                img.style.width = '100%';
                img.style.height = '100%';

                cells[selected_cell].appendChild(img);

                saveGameInfo();

                removeErr();
                checkErr(index + 1);

                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                }, 500);

                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
            }
        });
    });
};

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
        }
    }, 1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}

document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        isNewGame = true;
        score = 0;
        updateScore();
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        isNewGame = false;
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});
document.querySelector('#btn-pause').addEventListener('click', () => {
    pause_screen.classList.add('active');
    pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
    pause_screen.classList.remove('active');
    pause = false;
});

document.querySelector('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    console.log('object')
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value', 0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
})

const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();

    document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
}

init();
