export class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 32; this.h = 32;
        this.hp = 100;
        this.speed = 4;
    }
    update(input) {
        if (input.up) this.y -= this.speed;
        if (input.down) this.y += this.speed;
        if (input.left) this.x -= this.speed;
        if (input.right) this.x += this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}