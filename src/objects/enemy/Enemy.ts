import Phaser from "phaser";
import initAnimations from './EnemyAnimation';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    
    private static initialized = false;
    private bod;
    protected id;
    protected numId;
    protected speed = 100;
    protected gravity = 0;
    protected timer = 0;
    protected isActive = true;
    protected checkIfTimeout = false;

    constructor(scene: Phaser.Scene, x: number, y: number, gravity: number, numId: number, id: string) {
        super(scene, x, y, id);
        this.id = id
        // add object to scene 
        scene.add.existing(this);
        scene.physics.add.existing(this);

        if(!Enemy.initialized) {
            initAnimations(this.scene.anims);
            Enemy.initialized = true;
        }
        if(id === 'mushroom') {
            this.scale = 1.5
            this.setSize(20, 40);
            this.setOffset(65,60)
        }else if(id ==='bird'){
            this.scale = 1.4
            this.setOffset(0,0)
        }else if(id ==='rock'){
            this.scale = 1.4
            this.setOffset(0,0)
        }
        else {
            this.scale = 0.12
            this.setSize(350, 500);
        }

        this.setCollideWorldBounds(true);
        this.gravity = gravity;
        this.setGravityY(this.gravity);
        this.numId = numId;

        this.bod = this.body as Phaser.Physics.Arcade.Body;

    }

    public getIsActive(){
        return this.isActive;
    }
    
    public setInactive(){
        setTimeout(() =>{
            this.isActive = true;
            this.setAlpha(1);
            this.speed = 100
            this.checkIfTimeout = false;
        }, 2000)
        this.speed = 0
        this.setAlpha(0.2);
        this.checkIfTimeout = true;
        
    }
    setIsActive(b : boolean){
        this.isActive = b;
    }

    spawnRandomPos(randomZones, enemyLocations, yOffset){
        let randomNumberZone = 0
        do{
            randomNumberZone = Phaser.Math.Between(0, randomZones.length-1);
        } while (randomNumberZone == enemyLocations[0] || randomNumberZone == enemyLocations[1])
        const randomZone = randomZones[randomNumberZone];
        this.setPosition(Phaser.Math.FloatBetween(randomZone.x, randomZone.x+randomZone.width),Phaser.Math.FloatBetween(randomZone.y, randomZone.y+randomZone.height)-yOffset);
        enemyLocations[this.numId] = randomNumberZone;
        return enemyLocations;
    }

    update(time, delta) {
        if (this.active == false) {
            return;
        }
        if (!this.isActive && !this.checkIfTimeout) {
            this.setInactive();
        }
        if(this.id === 'mushroom') {
            if(this.speed != 0) {
                this.play('mushroomRun', true)
            }
            else {
                this.play('mushroomIdle', true)
            }
        }
        else if(this.id === 'bird') {
            this.play('birdRun', true)
        }else if(this.id === 'rock') {
            this.play('rockIdle', true)
        }
        if(this.speed>0) {
            this.flipX=false
        }
        this.setVelocityX(this.speed)
        this.timer += delta;
        while (this.timer > 50) {
            if (this.bod.onWall()) {
                this.flipX = !this.flipX
                this.speed *= -1
            }
            this.timer -= 50;
        }
    }
}
