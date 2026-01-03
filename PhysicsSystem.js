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
    }// PhysicsSystem.js 內
    static checkPlayerEnemyCollisions(player, enemies, game) {
        enemies.forEach(enemy => {
            if (enemy.isDead) return; // 死掉的怪不造成傷害

            // 簡單的圓形或矩形碰撞判斷
            const dx = (player.x + player.w / 2) - (enemy.x + enemy.w / 2);
            const dy = (player.y + player.h / 2) - (enemy.y + enemy.h / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 動態計算半徑：玩家半徑(約15) + 敵人半徑(寬度的一半)
            const playerRadius = 15;
            const enemyRadius = enemy.w / 2;

            // 如果距離小於兩者半徑之和 (約 20~25 像素)
            if (distance < playerRadius + enemyRadius) {
                // 呼叫 GameEngine 的受傷處理
                game.handlePlayerDamage(enemy.damage || 10);

                // 4. 進階彈開邏輯 (Knockback)
                // 彈開總距離：根據怪物的半徑再加固定緩衝，確保完全脫離碰撞區
                const knockbackDist = enemyRadius + 15;
                const ratioX = dx / distance;
                const ratioY = dy / distance;

                // 玩家往後退 (dx, dy 是從敵人指向玩家的方向)
                player.x += ratioX * knockbackDist;
                player.y += ratioY * knockbackDist;

                // 敵人也稍微往後縮一點，增加碰撞的重量感
                enemy.x -= ratioX * 10;
                enemy.y -= ratioY * 10;
            }
        });
    }
}