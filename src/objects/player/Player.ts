import Phaser from "phaser";
import Attacks from '../attack/Attacks';
import GroupAttacks from '../attack/GroupAttacks';
import initAnimations from './PlayerAnimation';
import PreScene from "../../scenes/PreScene";


export default class Player extends Phaser.Physics.Arcade.Sprite {

    private static initialized = false;
    private playerX: number;
    private playerY: number;
    private gravity = 500;
    private static playerSpeed = 200;
    private jumpCount = 0;
    private allowedJumps = 1;
    private cursors = this.scene.input.keyboard.createCursorKeys();
    private bod;
    private lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
    public GroupAttacks;
    private keys : Record<string, Phaser.Input.Keyboard.Key>;
    private clockAnimation;
    public static moving= false;
    private level;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        this.playerX = x;
        this.playerY = y; 

        this.level=scene
        // add object to scene 
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(this.gravity);

        this.bod = this.body as Phaser.Physics.Arcade.Body;
        this.GroupAttacks = new GroupAttacks(this.scene);
        if(!Player.initialized) {
            initAnimations(this.scene.anims);
            Player.initialized = true;
        }
        Player.playerSpeed=200;
        this.keys = this.scene.input.keyboard.addKeys('W,A,D') as Record<string, Phaser.Input.Keyboard.Key>;

        this.clockAnimation = scene.add.sprite(x, y - 50, 'clock');
        this.clockAnimation.setVisible(false);
        
        Player.moving=false;
    }

    update() {

        // Player movement
        const { left, right, up, space } = this.cursors;
        const istUpJustDown = Phaser.Input.Keyboard.JustDown(up);
        const istSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        const istWJustDown = Phaser.Input.Keyboard.JustDown(this.keys.W);

        if (left.isDown ||this.keys.A.isDown) {
            this.setVelocityX(-Player.playerSpeed);
            this.setFlipX(true);
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            Player.moving=true;
        }
        else if (right.isDown||this.keys.D.isDown) {
            this.setVelocityX(Player.playerSpeed);
            this.setFlipX(false);
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
            Player.moving=true;
        }
        else {
            this.setVelocityX(0);
            Player.moving=false;
        }

        //allow player to jump only #allowedJumps time

        if ((istUpJustDown || istWJustDown) && (this.bod.onFloor() || this.allowedJumps > this.jumpCount)) {
            this.setVelocityY(-Player.playerSpeed * 1.8);
            this.jumpCount++;
            const jump = this.scene.sound.add("jump_s").setVolume(0.1)
            jump.play();
        }
        if (this.bod.onFloor()) {
            this.jumpCount = 0;
        }
        // change animation depending on state 
        if (this.bod.onFloor()) {
            if (this.body.velocity.x !== 0) {
                this.play('run',true)
            } else {
                this.play('stand', true);
            }
        } else {
            this.play('jump', true);
        }
        // allow player to attack by pressing on space
        if (istSpaceJustDown) {
            const attack = new Attacks(this.scene, this.x, this.y, 'iceball');
            const shooting = this.scene.sound.add("shot_s").setVolume(0.1)
            shooting.play();
            this.GroupAttacks.add(attack);
            attack.fire(this);
        }
        this.clockAnimation.setPosition(this.x, this.y - 50);
    }
    /**
     * destroy diamond after collecting
     * @param collectable
     */
    onCollect(collectable) {
        collectable.destroy();
    }

    /**
     * this function makes enemy invisible and destroys iceball 
     * @param enemy 
     * @param items 
     */
    shoot(enemy, items) {
        items.destroy();
        enemy.setIsActive(false);
    }

    /**
     * reset Player position afer losing life 
     */
    loseLife() {
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.setPosition(this.playerX,this.playerY);
    }

    increaseSpeed() {
        // Increase the player speed based on the collected coins count
        Player.playerSpeed = Player.playerSpeed + 20;
    }

    showStateAdvancement() {
        this.clockAnimation.stop();

        this.clockAnimation.setFrame(0);

        this.clockAnimation.setVisible(true);

        this.level.updateFrameColor(0xff0000);

        this.clockAnimation.play('clock', true);

        this.scene.time.delayedCall(2000, () => {
            this.clockAnimation.setVisible(false);
            this.level.updateFrameColor(0x000000);
        });
    }

    public static get getPlayerSpeed(): integer {
        return this.playerSpeed;
    }
}
       