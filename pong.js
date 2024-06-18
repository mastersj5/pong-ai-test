const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

// Set initial canvas size
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

// Resize the canvas to fill browser window dynamically
window.addEventListener('resize', () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    // Update ball position to be within canvas
    ball.x = Math.min(ball.x, canvas.width - ball.radius);
    ball.y = Math.min(ball.y, canvas.height - ball.radius);

    // Update right paddle position to be within canvas
    rightPaddle.x = canvas.width - rightPaddle.width - 10; // 10 is the margin from the right edge
});

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 2,
    dx: 2,
    dy: 2
};

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    context.fillStyle = 'purple';
    context.fill();
    context.closePath();
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1; // reverse the direction
    }

    // if ball hit the right paddle
    if(collisionDetect(rightPaddle, ball)) {
        ball.dx *= -1; // reverse the direction
        hitSound.play();
    }

    // if ball hit the left paddle
    if(collisionDetect(leftPaddle, ball)) {
        ball.dx *= -1; // reverse the direction
        hitSound.play();
    }

    // if ball goes beyond the right paddle
    if(ball.x + ball.radius > canvas.width) {
        // player on the left wins
        leftScore++;
        scoreSound.play();
        addStars(ball.x, ball.y, 100); // add stars at ball's position
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        //addStars(canvas.width / 4, canvas.height / 5, 100); // add stars
    }

    // if ball goes beyond the left paddle
    if(ball.x - ball.radius < 0) {
        // player on the right wins
        rightScore++;
        scoreSound.play();
        addStars(ball.x, ball.y, 100); // add stars at ball's position
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        //addStars(3 * canvas.width / 4, canvas.height / 5, 100); // add stars
    }
}

const paddleWidth = 15, paddleHeight = 80;

let leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 2
};

let rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 2
};

function drawPaddle(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

let upArrowPressed = false;
let downArrowPressed = false;
let wKeyPressed = false;
let sKeyPressed = false;

// event listeners to move paddles
window.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowUp':
            upArrowPressed = true;
            break;
        case 'ArrowDown':
            downArrowPressed = true;
            break;
        case 'w':
            wKeyPressed = true;
            break;
        case 's':
            sKeyPressed = true;
            break;
    }
});

window.addEventListener('keyup', function(event) {
    switch(event.key) {
        case 'ArrowUp':
            upArrowPressed = false;
            break;
        case 'ArrowDown':
            downArrowPressed = false;
            break;
        case 'w':
            wKeyPressed = false;
            break;
        case 's':
            sKeyPressed = false;
            break;
    }
});

function collisionDetect(paddle, ball) {
    return ball.x < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
}

let leftScore = 0;
let rightScore = 0;

function drawScore() {
    context.font = '35px Arial';
    context.fillStyle = 'white'; // change color to white
    context.fillText(leftScore, canvas.width / 4, canvas.height / 5);
    context.fillText(rightScore, 3 * canvas.width / 4, canvas.height / 5);
}

let hitSound = new Audio('hit.wav');
let scoreSound = new Audio('score.wav');

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 5;
        this.speedX = (Math.random() - 0.5) * 10; // random velocity in x direction
        this.speedY = (Math.random() - 0.5) * 10; // random velocity in y direction
        this.opacity = 1;
        this.opacitySpeed = 0.000001; // adjust this value to change the speed of fading
    }

    draw() {
        context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        context.beginPath();
        // Star drawing method
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;
        let rotation = Math.PI / 2 * 3;
        let x = this.x;
        let y = this.y;
        let step = Math.PI / spikes;
    
        context.moveTo(x, y - outerRadius) // start from the top of the star
        for (let i = 0; i < spikes; i++) {
            x = this.x + Math.cos(rotation) * outerRadius;
            y = this.y + Math.sin(rotation) * outerRadius;
            context.lineTo(x, y);
            rotation -= step; // rotate for the outer point of the star
    
            x = this.x + Math.cos(rotation) * innerRadius;
            y = this.y + Math.sin(rotation) * innerRadius;
            context.lineTo(x, y);
            rotation -= step; // rotate for the inner point of the star
        }
        context.lineTo(this.x, this.y - outerRadius);
        context.closePath();
        context.fill();
    }

    update() {
        this.x += this.speedX; // update x position
        this.y += this.speedY; // update y position
        if (this.size > 0.2) this.size -= 0.1;
        if (this.opacity > 0) this.opacity -= this.opacitySpeed;
        if (this.opacity <= 0) {
            // remove the star from the array when it's no longer visible
            stars = stars.filter(star => star !== this);
        }
    }
}

let stars = [];

function addStars(x, y, count) {
    for (let i = 0; i < count; i++) {
        stars.push(new Star(x, y));
    }
}

function drawNet() {
    context.beginPath();
    context.setLineDash([4, 15]); // set the dash and gap lengths
    context.moveTo(canvas.width / 2, 0); // start at the top center of the canvas
    context.lineTo(canvas.width / 2, canvas.height); // draw to the bottom center
    context.strokeStyle = 'white';
    context.stroke();
    context.setLineDash([]); // reset the dash setting
}

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    updateBall();
    drawPaddle(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, 'red');
    drawPaddle(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, 'blue');
    drawScore();
    drawNet();

    // move the paddles
    if(upArrowPressed && rightPaddle.y > 0) {
        rightPaddle.y -= rightPaddle.dy;
    } else if(downArrowPressed && (rightPaddle.y < canvas.height - rightPaddle.height)) {
        rightPaddle.y += rightPaddle.dy;
    }

    if(wKeyPressed && leftPaddle.y > 0) {
        leftPaddle.y -= leftPaddle.dy;
    } else if(sKeyPressed && (leftPaddle.y < canvas.height - leftPaddle.height)) {
        leftPaddle.y += leftPaddle.dy;
    }

    requestAnimationFrame(animate);

    // animate stars
    for (let i = 0; i < stars.length; i++) {
        stars[i].draw();
        stars[i].update();
        if (stars[i].size <= 0.2 || stars[i].opacity <= 0) {
            stars.splice(i, 1);
            i--;
        }
    }
}


animate();
