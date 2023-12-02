const BLOCK_SIZE = 20;
let blocks = []
const Blocks = [
    [
        new Component(2, 2, "yellow", 0, 0)
    ],
    [
        new Component(4, 1, "lightblue", 0, 0)
    ],
    [
        new Component(3, 1, "pink", 0, 0),
        new Component(1, 1, "pink", 1, 1)
    ],
    [
        new Component(1, 2, "green", 1, 0),
        new Component(1, 2, "green", 0, 1),
    ],
    [
        new Component(1, 3, "orange", 1, 0),
        new Component(1, 1, "orange", 0, 2)
    ]
];

function onLoad() {
    gameArea.load();
}

let gameArea = {
    canvas: document.createElement("canvas"),
    load: function () {
        this.canvas.width = 200;
        this.canvas.height = 400;
        this.canvas.style.border = "1px solid black"
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.time = 0;
        this.interval = setInterval(updateGameArea, 1000);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
gameArea.canvas.addEventListener('mousemove', function (evt) {

}, false)

function Component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 1;
    this.x = x;
    this.y = y - 1;
    this.update = function () {
        let ctx = gameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE, this.width * BLOCK_SIZE, this.height * BLOCK_SIZE);
    }
    this.newPos = function () {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.reset = function () {
        this.speedX = 0;
        this.speedY = 0;
    }
}

function updateGameArea() {
    gameArea.clear();
    if (gameArea.time % 5 === 0) {
        generateBlocks();
    }
    gameArea.time += 1;
    blocks.forEach(block => {
        block.forEach(value => {
                value.newPos()
                value.update()
            }
        )
    })
}

function generateBlocks() {
    blocks.push(Blocks[Math.floor(Math.random() * 5)])
}