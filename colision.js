const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

class Circle {
    constructor(x, radius, color, text, speed) {
        this.posX = x;
        this.posY = window_height + radius; // Comienza justo fuera del margen inferior
        this.radius = radius;
        this.color = color;
        this.originalColor = color;
        this.text = text;
        this.speed = speed;
        this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed; // Dirección aleatoria en X
        this.dy = -this.speed; // Solo se mueve hacia arriba
        this.collisionTimeout = 0;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);
        this.posX += this.dx;
        this.posY += this.dy;

        // Si llega al borde superior, reiniciarlo en la parte inferior
        if (this.posY + this.radius < 0) {
            this.resetPosition();
        }

        // Cambiar dirección en X si llega al borde
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Restablecer el color después de que expire el temporizador
        if (this.collisionTimeout > 0) {
            this.collisionTimeout--;
        } else {
            this.color = this.originalColor;
        }
    }

    resetPosition() {
        this.posY = window_height + this.radius; // Reinicia la posición Y
        this.posX = Math.random() * (window_width - this.radius * 2) + this.radius; // Nueva posición aleatoria en X

        // Asegurarse de que no colisione con otros círculos al reiniciar
        while (this.isCollidingWithAny(circles)) {
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
        }
    }

    isCollidingWith(otherCircle) {
        const distance = Math.sqrt(
            (this.posX - otherCircle.posX) ** 2 + (this.posY - otherCircle.posY) ** 2
        );
        return distance < this.radius + otherCircle.radius;
    }

    isCollidingWithAny(circles) {
        for (let circle of circles) {
            if (this !== circle && this.isCollidingWith(circle)) {
                return true; // Hay colisión con otro círculo
            }
        }
        return false; // No hay colisión
    }

    setCollisionColor() {
        this.color = "#0000FF";
        this.collisionTimeout = 30;
    }

    isMouseOver(mouseX, mouseY) {
        const distance = Math.sqrt(
            (this.posX - mouseX) ** 2 + (this.posY - mouseY) ** 2
        );
        return distance < this.radius; // Verifica si el mouse está dentro del círculo
    }
}

let circles = [];

function generateCircles(n) {
    while (circles.length < n) {
        let radius = Math.random() * 30 + 20;
        let x = Math.random() * (window_width - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        let speed = Math.random() * 2 + 1;
        let text = `C${circles.length + 1}`;

        // Verificar si hay colisiones con círculos existentes
        const newCircle = new Circle(x, radius, color, text, speed);
        let collision = false;

        for (let circle of circles) {
            if (newCircle.isCollidingWith(circle)) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            circles.push(newCircle);
        }
    }
}

function handleCollision(circle1, circle2) {
    let tempDx = circle1.dx;
    circle1.dx = circle2.dx;
    circle2.dx = tempDx;

    let tempDy = circle1.dy;
    circle1.dy = circle2.dy;
    circle2.dy = tempDy;
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].isCollidingWith(circles[j])) {
                circles[i].setCollisionColor();
                circles[j].setCollisionColor();
                handleCollision(circles[i], circles[j]);
            }
        }
    }

    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener("click", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    circles = circles.filter(circle => !circle.isMouseOver(mouseX, mouseY)); // Eliminar círculo si el mouse está sobre él
});

// Generar círculos y comenzar la animación
generateCircles(10);
animate();
