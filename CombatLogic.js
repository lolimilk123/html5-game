// CombatLogic.js
import { EffectManager } from './EffectManager.js';

export class CombatLogic {
    // CombatLogic.js
    static handleExplosion(engine, x, y, radius) {
        EffectManager.createExplosion(engine.particles, x, y, radius);

        // 計算本次爆炸的總傷害
        const totalDamage = Math.floor(engine.stats.damage * engine.stats.explosionMult) + engine.stats.explosionDamage;
        // 確保傷害至少為 1
        const finalDamage = Math.max(1, totalDamage);

        // --- 修正處：改用 enemyManager.enemies ---
        engine.enemyManager.enemies.forEach(enemy => {
            if (enemy.isDead || enemy.hp <= 0) return;
            const dist = Math.hypot(enemy.x - x, enemy.y - y);
            if (dist < radius) {
                enemy.takeDamage(finalDamage);
                if (enemy.hp <= 0) engine.handleEnemyDeath(enemy);
            }
        });
    }

    // CombatLogic.js

    static handleBounce(engine, bullet, currentEnemy) {
        // 確保彈跳邏輯也會檢查/更新 hitHistory
        if (!bullet.hitHistory) bullet.hitHistory = new Set();
        bullet.hitHistory.add(currentEnemy);

        let nearestEnemy = null;
        let minDist = engine.stats.bounceRange || 300;

        engine.enemyManager.enemies.forEach(enemy => {
            // 尋找「非當前」、「沒死」、「且這顆子彈沒撞過」的敵人
            if (enemy === currentEnemy || enemy.isDead || bullet.hitHistory.has(enemy)) return;
            const dist = Math.hypot(enemy.centerX - bullet.x, enemy.centerY - bullet.y);
            if (dist < minDist) {
                minDist = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            EffectManager.createHitEffect(engine.particles, bullet.x, bullet.y);
            const angle = Math.atan2(nearestEnemy.centerY - bullet.y, nearestEnemy.centerX - bullet.x);

            bullet.dx = Math.cos(angle) * bullet.speed;
            bullet.dy = Math.sin(angle) * bullet.speed;

            // --- 修正點：將子彈座標推開，防止瞬間重複觸發 ---
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            return true;
        }
        return false;
    }
}