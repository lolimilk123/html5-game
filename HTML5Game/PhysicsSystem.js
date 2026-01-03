export class PhysicsSystem {
    // 圓形碰撞檢測 (子彈與敵人)
    static checkCircleRect(bullet, rect) {
        return bullet.x > rect.x && bullet.x < rect.x + rect.w &&
               bullet.y > rect.y && bullet.y < rect.y + rect.h;
    }

    static updateCollisions(bullets, enemies, onHit) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (this.checkCircleRect(bullets[i], enemies[j])) {
                    onHit(bullets[i], enemies[j], i, j);
                    break; 
                }
            }
        }
    }
}