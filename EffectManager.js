// EffectManager.js
import { Particle } from './Particle.js';
import { ExplosionVisual } from './ExplosionVisual.js';

export class EffectManager {
    static createHitEffect(particles, x, y) {
        // 擊中時的小火花
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(x, y, "#FF4444", 2, 4));
        }
    }

    static createDeathEffect(particles, x, y) {
        // 死亡時的大量噴血
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(x, y, "#FF0000", 5, 10));
        }
    }

    static createExplosion(particles, x, y, radius) {
        // 爆炸視覺
        particles.push(new ExplosionVisual(x, y, radius));
    }



    static damageOverlay = { alpha: 0, color: "255, 0, 0" };

    // 改名為受傷觸發
    static triggerDamageFlash() {
        this.damageOverlay.alpha = 0.6; // 強度
    }

    static updateOverlay() {
        if (this.damageOverlay.alpha > 0) {
            this.damageOverlay.alpha -= 0.04; // 消失速度加快 (約 0.25 秒)
        }
    }

    static drawOverlay(ctx, canvas) {
        if (this.damageOverlay.alpha <= 0) return;

        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 使用受傷專用的邊緣暈影
        const grad = ctx.createRadialGradient(centerX, centerY, canvas.width * 0.1, centerX, centerY, canvas.width * 0.9);
        grad.addColorStop(0, "rgba(255, 0, 0, 0)");
        grad.addColorStop(0.7, `rgba(255, 0, 0, ${this.damageOverlay.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(255, 0, 0, ${this.damageOverlay.alpha})`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}