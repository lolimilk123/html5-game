export class CameraSystem {
    constructor() {
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    // 觸發震動
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    // 計算每一幀的位移
    update() {
        if (this.shakeTime > 0) {
            this.offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            this.offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeTime--;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    // 在畫布繪製前套用位移
    apply(ctx) {
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
    }

    // 在畫布繪製後還原
    restore(ctx) {
        ctx.restore();
    }
}