import Phaser from "phaser";
import Enemy from "./Enemy";
import Player from "../player/Player";
import initAnimations from './EnemyAnimation';

export default class BossEnemy extends Enemy {
    private projectileTimer: number;
    private projectileInterval: number;
    private minDistance: number;
    private maxDistance: number;
    private player: Player;
    private projectiles: Phaser.Physics.Arcade.Group;
    private firedProjectiles: Phaser.Physics.Arcade.Sprite[];
    private isImmune: boolean;
    private speechBubble: Phaser.GameObjects.Text;
    private speechBubbleDuration: number;
    private lives: number;

    constructor(scene: Phaser.Scene, x: number, y: number, gravity: number, numId: number, id: string, player: Player) {
        super(scene, x, y, gravity, numId, id);
        this.projectileTimer = 0;
        this.projectileInterval = 1857;
        this.minDistance = 250;
        this.maxDistance = 1000;
        this.player = player;
        this.projectiles = scene.physics.add.group();
        this.firedProjectiles = [];
        this.isImmune = true;
        this.speechBubble = null;
        this.speechBubbleDuration = 8000;
        this.lives = 3;
        this.updateBossHearts();
        this.createSpeechBubble();
        if (id === 'boss') {
            this.scale = 2;
            this.setSize(40, 30);
            this.setOffset(55,60);
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
        if (this.active && this.isActive && !this.checkIfTimeout && this.player) {
            const player = this.player;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

            if (distance >= this.minDistance && distance <= this.maxDistance) {
                this.projectileTimer += delta;

                if (this.projectileTimer >= this.projectileInterval) {
                    this.projectileTimer -= this.projectileInterval;
                    this.shootProjectile(player);
                }
            }
        }
        const player = this.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance >= this.minDistance && distance <= this.maxDistance) {
            if(this.id === 'boss') {
                this.play('bossCast', true);
            }
        }else{
            if(this.id === 'boss') {
                this.play('bossIdle', true);
            }
        }
        if (this.isImmune) {
            this.setAlpha(0.5);
        } else {
            this.setAlpha(1);
        }
    }

    shootProjectile(target: Phaser.GameObjects.Sprite) {
        const projectile = this.projectiles.create(this.x, this.y, 'fireball');

        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(300);

        projectile.setRotation(angle);
        projectile.setVelocity(velocity.x, velocity.y);

        this.firedProjectiles.push(projectile);
    }
    createSpeechBubble() {
        const bubbleTextStyle = {
            fontSize: '16px',
            fontFamily: 'Arial',
            align: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            padding: {
                x: 5,
                y: 5
            }
        };
    
        this.speechBubble = this.scene.add.text(this.player.x, this.player.y - 50, '', bubbleTextStyle);
        this.speechBubble.setOrigin(0.5);
        this.speechBubble.setDepth(999);
        this.speechBubble.setText([
            "The Boss has 3 lives.",
            "When you reach the final state, the MDP resets and the Boss becomes vulnerable.",
            "Good luck!"
        ]);
    
        this.scene.time.delayedCall(this.speechBubbleDuration, () => {
            this.speechBubble.destroy();
            this.speechBubble = null;
        });
    }
    getProjectiles() {
        return this.projectiles;
    }
    getFiredProjectiles() {
        return this.firedProjectiles;
    }
    getImmune(){
        return this.isImmune;
    }
    toggleImmune(){
        this.isImmune = !this.isImmune;
    }
    looseLife(){
        this.lives--;
    }
    updateBh(){
        this.updateBossHearts();
    }
    updateBossHearts() {
        // Remove all existing heart images
        const heartIcon = 'heart';
        const existingHearts = this.scene.children.getAll().filter((child) => child instanceof Phaser.GameObjects.Image && child.texture.key === heartIcon);
        existingHearts.forEach((heart) => heart.destroy());
    
        // Create new heart images based on the updated lives count
        const heartSpacing = 20;
        const heartOffsetY = -70;
    
        for (let i = 0; i < this.lives; i++) {
            const heart = this.scene.add.image(this.x - (heartSpacing * (this.lives - 1)) / 2 + (heartSpacing * i), this.y + heartOffsetY, heartIcon);
            heart.setDepth(0);
        }
    }
    
    
    getLife(){
        return this.lives;
    }
    destroyAllProjectiles() {
        this.projectiles.getChildren().forEach((projectile: Phaser.Physics.Arcade.Sprite) => {
            projectile.destroy();
        });
        this.projectiles.clear();
      
        this.firedProjectiles.forEach((projectile: Phaser.Physics.Arcade.Sprite) => {
            projectile.destroy();
        });
        this.firedProjectiles.length = 0;
    }
}
