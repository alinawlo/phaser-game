import Phaser from "phaser";
import Enemy from "./Enemy";

export default class FlyingEnemy extends Enemy {

    private timeInterval;
    constructor(scene: Phaser.Scene, x: number, y: number, gravity: number, timeInterval: number, numId: number, id: string) {
        super(scene,x,y,gravity,numId, id);
        this.timeInterval = timeInterval

        if(id === 'eye'){
            this.scale = 1.5
            this.setSize(40, 30);
            this.setOffset(55,60)
            this.id = id
        }
    }

    update(time, delta) {
        if(this.active==false ) {
            return;
        }
        if (!this.isActive && !this.checkIfTimeout) {
            this.setInactive();
        }
        if(this.id === 'eye') {
            if(this.speed != 0) {
                this.play('eyeFlight', true)
            }
            else { 
                this.stop()
            }
        }
        if(this.speed>0) {
            this.flipX=false
        }
        this.setVelocityX(this.speed)
        this.timer += delta;
        while (this.timer > this.timeInterval) {
            this.flipX = !this.flipX
            this.speed *= -1
            this.timer -= this.timeInterval;
        }
    
    }
}
