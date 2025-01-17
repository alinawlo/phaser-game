import Phaser from 'phaser';
import Player from '../player/Player';

export default class Attacks extends Phaser.Physics.Arcade.Sprite {

    private static speed = 400;
    private static maxDistance = 150;
    private traveldDistance = 0;

    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);


        // Adjust the size of the attack's body
        if(scene.widerShots){
            Attacks.maxDistance += 30
            scene.shootWider(false)
        } 

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        this.traveldDistance += this.body.deltaAbsX();
        
        if(Player.moving){
            if (this.traveldDistance >= Attacks.maxDistance + Player.getPlayerSpeed/2){
                this.destroy();
            }
        } else if (this.traveldDistance >= Attacks.maxDistance) {
            this.destroy();
        }

    }
    /**
     * allows player to fire 
     */
    fire(player) {

        if (player.lastDirection == Phaser.Physics.Arcade.FACING_RIGHT) {
            this.setVelocityX(Attacks.speed);
        } else {
            this.setVelocityX(-Attacks.speed);
            this.setFlipX(true);
        }

    }

    public static intitializeShotwidth(width: integer){
        Attacks.maxDistance=width;
    }

    public static intitializeShotSpeed(speed: integer){
        Attacks.speed=speed;
    }

}