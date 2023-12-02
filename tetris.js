const BLOCK_SIZE = 20;
let blocks = [];
let deadBlocks = [];
const Blocks = [
    {
        width: 2,
        height: 2,
        color: 1,
        pos: [0, 1, 2, 3],
        rotation: [
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3]
        ]
    },
    {
        width: 4,
        height: 1,
        color: 2,
        pos: [0, 1, 2, 3],
        rotation: [
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
            [0, 1, 2, 3],
        ]
    },
    {
        width: 3,
        height: 2,
        color: 3,
        pos: [0, 1, 2, 4],
        rotation: [
            [0, 1, 2, 4],
            [1, 2, 3, 5],
            [1, 3, 4, 5],
            [0, 2, 3, 4]
        ]
    },
    {
        width: 2,
        height: 3,
        color: 4,
        pos: [1, 2, 3, 4],
        rotation: [
            [1, 2, 3, 4],
            [0, 1, 4, 5],
            [1, 2, 3, 4],
            [0, 1, 4, 5]
        ]
    },
    {
        width: 2,
        height: 3,
        color: 5,
        pos: [1, 3, 4, 5],
        rotation: [
            [1, 3, 4, 5],
            [0, 3, 4, 5],
            [0, 1, 2, 4],
            [0, 1, 2, 5]
        ]
    }
];
let selectedId = -1;
let colors = new Map([
    [1, "yellow"],
    [2, "lightblue"],
    [3, "pink"],
    [4, "green"],
    [5, "orange"],
])
const ceiling = 3;

function onLoad() {
    gameArea.load();
}

let gameArea = {
    canvas: document.createElement("canvas"),
    load: function () {
        this.blockSize = BLOCK_SIZE
        this.canvas.width = 200;
        this.canvas.height = 400;
        this.width = Math.floor(this.canvas.width / this.blockSize);
        this.height = Math.floor(this.canvas.height / this.blockSize);
        this.canvas.style.border = "1px solid black"
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.start = false;
        this.time = 0;
        this.tempGameBoard = [];
        this.interval = setInterval(updateGameArea, 1000);
    },
    drawFrameLine: function () {
        const ctx = this.context;
        ctx.beginPath();
        for (let i = 0; i <= this.height; i++) {
            ctx.moveTo(0, i * this.blockSize);
            ctx.lineTo(this.canvas.width, i * this.blockSize);
        }
        for (let i = 0; i <= this.width; i++) {
            ctx.moveTo(i * this.blockSize, 0);
            ctx.lineTo(i * this.blockSize, this.canvas.height);
        }
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tempGameBoard = [];
        for (let i = 0; i < this.height; i++) {
            let l = [];
            for (let j = 0; j < this.width; j++) {
                l.push(0);
            }
            this.tempGameBoard.push(l);
        }
    },
    checkGameOver: function () {
        for (let i = 0; i < this.tempGameBoard[ceiling].length; i++) {
            if (this.tempGameBoard[ceiling][i] !== 0) {
                this.start = false;
            }
        }
    }
}
gameArea.canvas.addEventListener('mousedown', function (evt) {
    const rect = gameArea.canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    blocks.forEach((block) => {
        block.pos.forEach((p) => {
            if ((block.x + p % block.width) * BLOCK_SIZE <= x && x < (block.x + p % block.width + 1) * BLOCK_SIZE && (block.y + Math.floor(p / block.width)) * BLOCK_SIZE <= y && y < (block.y + Math.floor(p / block.width) + 1) * BLOCK_SIZE) {
                selectedId = block.id;
                gameArea.clear();
                deadBlocks.forEach(deadBlock => {
                    deadBlock.addDeath(gameArea.tempGameBoard);
                    deadBlock.update();
                })
                gameArea.checkGameOver();
                blocks.forEach(block => {
                    block.addToTemp(gameArea.tempGameBoard, gameArea.height);
                    block.update();
                })
                clearDeadBlocks();
                gameArea.drawFrameLine();
                block.drawBound();
            }
        })
    })
})

function Block(width, height, color, pos, x, y, rotation, id) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.speedY = 1;
    this.x = x;
    this.y = y - 1;
    this.last_x = this.x;
    this.last_y = this.y;
    this.dead = false;
    this.pos = pos;
    this.rotation = rotation;
    this.last_rotationIndex = 0;
    this.rotateIndex = 0;
    this.color = color
    this.update = function () {
        const ctx = gameArea.context;
        ctx.fillStyle = colors.get(this.color);
        this.pos.forEach(p => {
            ctx.fillRect((this.x + p % this.width) * BLOCK_SIZE, (this.y + Math.floor(p / this.width)) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        })
        this.last_x = this.x;
        this.last_y = this.y;
        this.last_rotationIndex = this.rotateIndex;
    }
    this.drawBound = function () {
        const ctx = gameArea.context;
        ctx.beginPath();
        ctx.rect(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE, this.width * BLOCK_SIZE, this.height * BLOCK_SIZE);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    this.newPos = function () {
        this.y += this.speedY;
    }
    this.checkBoundary = function (width) {
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > width) {
            this.x = width - this.width;
        }
    }
    this.revert = function () {
        this.x = this.last_x;
        this.y = this.last_y;
        if (this.last_rotationIndex !== this.rotateIndex) {
            this.rotateIndex = this.last_rotationIndex;
            let temp_width = this.width;
            this.width = this.height;
            this.height = temp_width;
            this.pos = this.rotation[this.rotateIndex];
        } else {
            this.dead = true;
        }
    }
    this.addToTemp = function (board, height) {
        if (this.y + this.height > height) {
            this.revert();
            return false;
        }
        this.pos.forEach(p => {
            if (board[this.y + Math.floor(p / this.width)][this.x + p % this.width] !== 0) {
                this.revert();
                this.pos.forEach(p => {
                    board[this.y + Math.floor(p / this.width)][this.x + p % this.width] = this.color;
                })
                return false;
            }
        })
        this.pos.forEach(p => {
                board[this.y + Math.floor(p / this.width)][this.x + p % this.width] = this.color;
            }
        )
        return true;
    }
    this.addDeath = function (board) {
        this.pos.forEach(p => {
            board[this.y + Math.floor(p / this.width)][this.x + p % this.width] = this.color;
        })
    }
    this.rotate = function () {
        this.rotateIndex = (this.rotateIndex + 1) % 4;
        let temp_width = this.width;
        this.width = this.height;
        this.height = temp_width;
        this.pos = this.rotation[this.rotateIndex];
    }
}

function updateGameArea() {
    if (!gameArea.start) return;
    gameArea.clear();
    if (gameArea.time % 5 === 0) {
        generateBlocks(Math.floor(Math.random() * 5), gameArea.time);
    }
    gameArea.time += 1;
    deadBlocks.forEach(deadBlock => {
        deadBlock.addDeath(gameArea.tempGameBoard);
        deadBlock.update();
    })
    gameArea.checkGameOver();
    blocks.forEach(block => {
        if (!block.dead) {
            block.newPos();
            block.addToTemp(gameArea.tempGameBoard, gameArea.height);
            block.update();
        }
    })
    clearDeadBlocks();
    gameArea.drawFrameLine();
    let selectedBlock = blocks.find((block) => block.id === selectedId);
    if (selectedBlock) selectedBlock.drawBound();
}

function clearDeadBlocks() {
    let addDeath = blocks.filter(function (block) {
        return block.dead;
    })
    if (addDeath.length !== 0) {
        addDeath.forEach((block) => {
            deadBlocks.push(block);
        })
    }
    blocks = blocks.filter(function (block) {
        return !block.dead;
    })
}

function onStart() {
    gameArea.start = true;
}

function onLeft() {
    if (!gameArea.start || selectedId === -1) return;
    let selectedBlock = blocks.find((block) => block.id === selectedId);
    if (!selectedBlock) return;
    gameArea.clear();
    deadBlocks.forEach(deadBlock => {
        deadBlock.addDeath(gameArea.tempGameBoard);
        deadBlock.update();
    })
    gameArea.checkGameOver();
    selectedBlock.x += -1;
    selectedBlock.checkBoundary(gameArea.width);
    blocks.forEach(block => {
        block.addToTemp(gameArea.tempGameBoard, gameArea.height);
        block.update();
    })
    clearDeadBlocks();
    gameArea.drawFrameLine();
    selectedBlock.drawBound();
}

function onRight() {
    if (!gameArea.start || selectedId === -1) return;
    let selectedBlock = blocks.find((block) => block.id === selectedId)
    if (!selectedBlock) return;
    gameArea.clear();
    deadBlocks.forEach(deadBlock => {
        deadBlock.addDeath(gameArea.tempGameBoard);
        deadBlock.update();
    })
    gameArea.checkGameOver();
    selectedBlock.x += 1;
    selectedBlock.checkBoundary(gameArea.width);
    blocks.forEach(block => {
        block.addToTemp(gameArea.tempGameBoard, gameArea.height);
        block.update();
    })
    clearDeadBlocks();
    gameArea.drawFrameLine();
    selectedBlock.drawBound();
}

function onRotate() {
    if (!gameArea.start || selectedId === -1) return;
    let selectedBlock = blocks.find((block) => block.id === selectedId)
    if (!selectedBlock) return;
    gameArea.clear();
    deadBlocks.forEach(deadBlock => {
        deadBlock.addDeath(gameArea.tempGameBoard);
        deadBlock.update();
    })
    gameArea.checkGameOver();
    selectedBlock.rotate();
    selectedBlock.checkBoundary(gameArea.width);
    blocks.forEach(block => {
        block.addToTemp(gameArea.tempGameBoard, gameArea.height);
        block.update();
    })
    clearDeadBlocks();
    gameArea.drawFrameLine();
    selectedBlock.drawBound();
}

function onReset() {
    blocks = [];
    deadBlocks = [];
    selectedId = -1;
    gameArea.start = false;
    gameArea.time = 0;
    gameArea.clear();
}

function onPause() {
    gameArea.start = !gameArea.start;
}

function generateBlocks(index = 0, id) {
    blocks.push(new Block(Blocks[index].width, Blocks[index].height, Blocks[index].color, Blocks[index].pos, Math.floor(Math.random() * (gameArea.width - Blocks[index].width + 1)), 0, Blocks[index].rotation, id))
    if (selectedId === -1) {
        selectedId = id;
    }
}