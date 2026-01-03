export class CombatSystem {
    static handleHit(bullet, enemy, stats, engine) {
        // 1. 基礎傷害
        enemy.takeDamage(stats.damage || 1);

        // 2. 特殊屬性判定 (爆炸)
        if (stats.explosionLevel > 0) {
            engine.triggerExplosion(enemy.x, enemy.y, stats.explosionRadius);
        }

        // 3. 特殊屬性判定 (彈跳)
        let bounced = false;
        if (stats.bounceLevel > 0 && bullet.bounceCount > 0) {
            bounced = engine.handleBounce(bullet, enemy);
        }

        // 4. 回傳子彈存續狀態
        return bounced;
    }
}