//import Phaser, { Create } from 'phaser';
import Player from '../../objects/player/Player';
import Enemy from '../../objects/enemy/Enemy';
import HUD from '../HUD';
import PauseButton from '../PauseButton';
import Coins from '../../objects/collectable/Coins';
import MDP from '../../MDP';
import CreateMap from '../../CreateMap';
import FlyingEnemy from '../../objects/enemy/FlyingEnemy';
import State from '../../State';
import LevelManager from '../LevelManager';
import MdpGraph from '../../MdpGraph';
import BossEnemy from '../../objects/enemy/BossEnemy';
import Attacks from '../../objects/attack/Attacks';


export default class Level_03 extends Phaser.Scene {
    private fadeOutTween!: Phaser.Tweens.Tween;
    private player: Player;
    private enemy: Enemy[] = [];
    private hud!: HUD;
    private pauseButton!: PauseButton;
    private collectable : Phaser.Physics.Arcade.StaticGroup;
    private gameIsOver : boolean;
    private levelFinished : boolean;
    private static fieldCoins: Coins[] = [];
    private MDP!: MDP;
    private state : State;
    private laststate;
    private heart : number;
    private score : number;
    private layer;
    private enemyLocation = [0, 0]; //Not the right LocationsNumber
    private flyingEnemyLocation = [0, 0]; //Not the right LocationsNumber
    private readonly map_w = 2512;
    private readonly map_h = 1440;
    private coinsCollected;
    private enemiesKilled;
    private Action1: string;
    private Action2: string;
    private MdpGraph;       
    private overlapActive: boolean;
    private exit;    
    private generate;
    public static map;
    private wider: boolean;
    private speedCounter=0
    private widthCounter=0
    private gate=0;
    private hitsound;
    private bosslives: number;
    private visualelements: object[];
    private removeMdp: Phaser.Events.EventEmitter;
    private frame;



    constructor() {
        super('level-03');
    }
    preload() {
        //background
        this.load.image('bg_lvl3_0', 'assets/level_3/background_0.png');
        this.load.image('bg_lvl3_1', 'assets/level_3/background_1.png');
        this.load.image('bg_lvl3_2', 'assets/level_3/background_2.png');
        //enemies
        this.load.image('bird', 'assets/enemies/Bird/bird.png');
        this.load.image('rock', 'assets/enemies/Rock/rock.png');
    }

    create() {
        // Level_03.fieldCoins.push(new Coins(this, 1104, 144,"c"))

        const start = this.sound.add("start_s").setVolume(0.1)
        start.play()
        this.hitsound = this.sound.add("hit_s").setVolume(0.1)
        //create map with its layers
        const map = CreateMap.createMap(this,3);
        this.layer = CreateMap.createLayers(map,3);
        Level_03.map = map;
        const collisionlayer = this.modifyMap(map);

        //create player on startZone 
        this.player = new Player(this, this.layer.playerZones.objects[0].x+80, this.layer.playerZones.objects[0].y);

        //create enemies
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[0].x, this.layer.enemy_spawns.objects[0].y, 500, 0, 'rock'));
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[1].x, this.layer.enemy_spawns.objects[1].y, 500, 1, 'bird'));
        this.enemy.push(new BossEnemy(this, this.layer.enemy_spawns.objects[2].x, this.layer.enemy_spawns.objects[2].y-100, 0, 0, 'boss', this.player));
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[3].x, this.layer.enemy_spawns.objects[3].y, 500, 3, 'rock'));
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[4].x, this.layer.enemy_spawns.objects[4].y, 500, 4, 'bird'));

        this.bosslives = 3;

        //get collectables from layer  
        this.collectable = CreateMap.getCollectables(this, this.layer.collectables);

        this.setCollider(collisionlayer);
        this.overlapActive = true;
        this.setOverlap();

        this.createEndOfLevel();

        this.gameIsOver = false;
        this.heart = 3;
        this.score = 0;
        this.coinsCollected = 0;
        this.enemiesKilled = 0;
        // pauseButton
        this.drawMdpGraph()

        this.pauseButton = new PauseButton(this, this.scene.key, this.state, false, 350);
        this.hud = new HUD(this, this.state);

        this.setupCamera();
        this.createBackGround();
        Attacks.intitializeShotwidth(150);

    }

    drawMdpGraph(){
        // Creating States with Transitions
        this.Action1 = "diamond";
        this.Action2 = "iceball";
        const width = this.cameras.main.width;
        this.state = new State(["A"],{x: width-240,y: 100});
        this.laststate = this.state;
        const stateD = new State(["D"],{x: width-170,y: 150});
        
        // Create MDP and add states
        this.MDP = new MDP(this.state ,stateD);
        this.MdpGraph = new MdpGraph(this, this.MDP);   
        // draw background
        const border1 = this.add
            .rectangle(width - (300+20), 20, 300, 260, 0xffffff, 0.5)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.MdpGraph.elements.push(border1);
        const border2 = this.add
            .rectangle(width - (300+30), 10, (300+20), (260+20), 0x000000, 0.6)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.frame=border2;
        this.MdpGraph.elements.push(border2);
        this.MdpGraph.createNodes();
        this.MDP.readfile("./assets/level_3/MDPGraph.txt", width, this.MdpGraph);
        

        const showMdpButton = this.add.text(window.innerWidth - 430, 30, "Hide MDP |", {
            fontSize: "24px",
            color: "#fff",
        }).setOrigin(1, 0).setDepth(1);
        
        showMdpButton.setInteractive().setScrollFactor(0.01, 0.01);
        
        // Function to toggle MDP visibility and update button text
        function toggleMdpVisibility() {
            const click = this.sound.add("click_s").setVolume(0.3)
            click.play()
            if (this.MdpGraph.setGraphVisible()) {
                showMdpButton.setText("Show MDP |");
            } else {
                showMdpButton.setText("Hide MDP |");
            }
        }
        // Event listener for button click
        showMdpButton.on("pointerdown", toggleMdpVisibility,this);
        
        // Event listener for 'm' key press
        this.input.keyboard.on("keydown-M", toggleMdpVisibility,this);
        
        // Hover effect
        showMdpButton.on("pointerover", () => {
            showMdpButton.setStyle({ fill: "#f00" });
        });

        showMdpButton.on("pointerout", () => {
            showMdpButton.setStyle({ fill: "#fff" });
        });
        this.removeMdp = new Phaser.Events.EventEmitter();
        this.removeMdp.on('remove', () => {
            this.MdpGraph.destroyGraphElements();
            this.input.keyboard.off("keydown-M", toggleMdpVisibility,this);
            showMdpButton.destroy();
            border1.destroy();
            border2.destroy();
        });
    }

    /**
     *  this function create background
     */
    createBackGround(){
        this.add.image(0,0, "bg_lvl3_0").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-5);
        this.add.image(0,0, "bg_lvl3_1").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-4);
        this.add.image(0,0, "bg_lvl3_2").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-3);
    }

    /**
     * this function modify map and create new layer for this level
     * @param map 
     */
    modifyMap(map: Phaser.Tilemaps.Tilemap){
        const platforms_collision = map.createLayer('platforms_collision', 'tiles-3').setDepth(-5);
        platforms_collision.setCollisionByExclusion([-1], true);
        return platforms_collision;
    }

    /**
     * this function set a zoom camera and follow the player
     * @param player 
     */
    setupCamera(){
        this.physics.world.setBounds(0, 0, this.map_w, this.map_h);
        this.cameras.main.setBounds(0, 0, this.map_w, this.map_h);
        this.cameras.main.startFollow(this.player);
    }

    /**
     * this function create exit of the level and an overlap function with the exit to end the level
     */
    createEndOfLevel() {
        this.anims.create({
            key: 'portal2',
            frames : this.anims.generateFrameNumbers('portal2',{start: 0, end: 5}),
            frameRate: 5,
            repeat: -1
        })
        this.exit = this.physics.add.sprite(this.layer.playerZones.objects[1].x-10, this.layer.playerZones.objects[1].y, 'end');
        this.exit.setVisible(false);
        this.physics.add.overlap(this.player, this.exit, () => {
            if (this.MDP.getCurrentState() === this.MDP.getGoalState() && this.bosslives==0){
                this.levelFinished = true;
            }
        })
    }


    /**
     *  this function set collider between enemy/player and platforms
     */
    setCollider(collisionlayer) {
        let isCodeRunnable = true;
        function blockCodeForDuration(duration) {
            isCodeRunnable = false;

            setTimeout(() => {
                isCodeRunnable = true;
            }, duration);
        }
        
        this.physics.add.collider(this.enemy, this.layer.platformsCollidersEnemeies);
            
        this.physics.add.collider(this.player, this.layer.platformsColliders);

        this.physics.add.collider(this.player, collisionlayer, () =>{
            if(isCodeRunnable){
                this.updateHeart();
                this.hitsound.play();
                blockCodeForDuration(15)
            }
        });

    }

    /**
     * this function update player's heart when player lose one
     */
    updateHeart() {

        this.pauseButton.updateHeartsValue(--this.heart);
        this.hud.updateHeart(this.heart);
        if(this.heart<3){
            this.MdpGraph.showHealthNode();
        }
        if (this.heart == 0) {
            this.gameIsOver = true;
            const death = this.sound.add("death_s").setVolume(0.1)
            death.play();
        }else{
            this.scene.launch('DamageScene', { sceneKey: this.scene.key, heartCount: this.heart, player: this.player })
            this.makePlayerBlink()
        }
        this.player.loseLife();
    }

    /**
     * this function update state of enemies after one has been killed
     * @param enemy 
     * @param items 
     */
    updateStateOfEnemies(enemy, items) {

        this.player.shoot(enemy, items);
        this.pauseButton.updateEnemiesKilled(++this.enemiesKilled);

        if (enemy instanceof FlyingEnemy) {
            this.flyingEnemyLocation = enemy.spawnRandomPos(this.layer.FlyEnemyRandomSpawns.objects, this.flyingEnemyLocation, 0)
        }else if(enemy instanceof BossEnemy && this.bosslives > 0){
            enemy.destroyAllProjectiles();
            this.enemyLocation = (enemy as Enemy).spawnRandomPos(this.layer.enemyRandomSpawns.objects, this.enemyLocation, 100)
        }else if(enemy instanceof BossEnemy && this.bosslives <= 0){
            enemy.updateBh();
            enemy.destroy();
        } else if(!(enemy instanceof BossEnemy)) {
            this.enemyLocation = (enemy as Enemy).spawnRandomPos(this.layer.enemyRandomSpawns.objects, this.enemyLocation, 0)
        }
    
    }

    /**
     * this function update score after one diamond has been collected  
     * @param collectables 
     */
    updateScore(collectables){

        this.player.onCollect(collectables);
        this.hud.updateScore(++this.score);
        this.pauseButton.updateScoreValue(this.score);
    }

    /**
     * this function apdate state depending on state of MDP 
     */
    updateState(){

        this.hud.updateState(this.state);
        this.pauseButton.updateStateValue(this.state);

    }

    makePlayerBlink(){
        // Create a tween to animate the opacity
        const blinkTween = this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 200,
            repeat: 5, // Number of times to repeat the tween (blink)
            yoyo: true, // Reverse the tween to bring back to original opacity
            onComplete: () => {
            // Reset the opacity after blinking
                this.player.alpha = 1;
            },
        });
        
        // Delayed callback to stop the blinking after 2 seconds
        this.time.delayedCall(2000, () => {
            blinkTween.stop();
            this.player.alpha = 1; // Ensure the opacity is set to the original value
        });
    }

    /**
     *  this function set up overlap between objects (enemy,iceball) ,(player,diamond), (enemy,player), (player,exit)
     */
    setOverlap() {
        let isCodeRunnable = true;
        function blockCodeForDuration(duration) {
            isCodeRunnable = false;

            setTimeout(() => {
                isCodeRunnable = true;
            }, duration);
        }

        this.physics.add.overlap(this.enemy, this.player, (e,) => {
            if (this.overlapActive && isCodeRunnable && (e as Enemy).getIsActive()) {
                this.updateHeart();
                this.hitsound.play();
                blockCodeForDuration(15);
            }
        });


        this.physics.add.overlap(this.enemy, this.player.GroupAttacks, (enemy, items) => {
            if (this.overlapActive) {
                if (!(enemy as Enemy).getIsActive()) {
                    return
                }
                const kill = this.sound.add("kill_s").setVolume(0.1)
                kill.play();
                if (enemy instanceof BossEnemy){
                    if(enemy.getImmune()){
                        return
                    }else{
                        enemy.looseLife();
                        this.bosslives--;
                        enemy.toggleImmune();
                        if(enemy.getLife()>0){
                            this.removeMdp.emit('remove');
                            this.drawMdpGraph();
                            this.updateStateOfEnemies(enemy, items);
                            enemy.updateBh();
                            return;
                        }
                    }
                }
                const tempState= this.state;
                this.updateStateOfEnemies(enemy, items);
                this.state = this.MDP.MDPcheck(this.Action2);
                this.MdpGraph.updateNodeColors();
                this.updateState();
                if(tempState.name!=this.state.name){
                    LevelManager.decidePowerup(this,this.state)
                }
            }
        });


        this.physics.add.overlap(this.player, this.collectable, (_player, collectables) => {
            if (this.overlapActive) {
                for (const enemy of this.enemy) {
                    if (enemy instanceof BossEnemy && this.state.name == 'C') {
                        if(enemy.getImmune()){
                            enemy.toggleImmune();
                        }
                    }
                }
                this.player.onCollect(collectables);
                LevelManager.diamondCollected(this);
            }
        });

        this.physics.add.overlap(this.player, Level_03.fieldCoins, (_player, coin) => {
            if (this.overlapActive) {
                const collectedCoin = coin as Coins;
                this.player.onCollect(collectedCoin);
                for (const enemy of this.enemy) {
                    if (enemy instanceof BossEnemy && this.state.name == 'C') {
                        if(enemy.getImmune()){
                            enemy.toggleImmune();
                        }
                    }
                }
                LevelManager.diamondCollected(this);
                const index = Level_03.fieldCoins.indexOf(collectedCoin);
                // Remove the coin from the fieldCoins array
                if (index > -1) {
                    Level_03.fieldCoins.splice(index, 1);
                }
            }
        });
    }

    fade() {
        this.fadeOutTween = this.tweens.add({
            targets: this.cameras.main,
            alpha: 0, // Fade to black
            duration: 3000,
            onComplete: () => {
                this.cameras.main.alpha = 0;
            }
        });
    }

    handleProjectileOverlap(){
        this.updateHeart();
        this.hitsound.play();
    }

    update(timer, delta) {
        this.player.update();
        Attacks.intitializeShotSpeed(Player.getPlayerSpeed+200);
        this.enemy.forEach((e) => {
            e.update(timer, delta);
            return null;
        });

        if (this.gameIsOver) {
            this.scene.pause(this.scene.key);
            this.scene.start('GameOver', { sceneKey: this.scene.key });
        }

        if (this.MDP.getCurrentState() == this.MDP.getGoalState() && this.bosslives == 0) {
            this.exit.setVisible(true);
            if(this.gate==0){
                const door = this.sound.add("door_s").setVolume(0.5)
                door.play();
                this.gate++;
            }
            this.exit.play('portal2', true);
        }
        if (this.levelFinished) {
            this.levelFinished = false;

            this.fade();

            this.time.delayedCall(4000, () => {
                this.scene.stop('level-03');
                this.scene.start('end-scene');
            }, [], this);
        }
        if(this.laststate != this.state){
            this.player.showStateAdvancement();
            this.laststate = this.state;
        }
        for (const enemy of this.enemy) {
            if (enemy instanceof BossEnemy) {
                const projectiles = enemy.getFiredProjectiles();

                projectiles.forEach((projectile: Phaser.Physics.Arcade.Sprite) => {
                    if (!projectile.getData('hasHitPlayer') && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), projectile.getBounds())) {
                        this.handleProjectileOverlap();
                        projectile.setData('hasHitPlayer', true);
                    }
                });
            }
        }
        // Handle collision and scoring logic here
        while ((this.collectable.countActive()+Level_03.fieldCoins.length) === 0) {
            // Generate new diamonds
            if(this.generate){
                LevelManager.generateDiamond(this,Level_03);
                this.generate=false;
            } 
        }
    }

    public get widerShots(): boolean {
        return this.wider;
    }

    public static updateField(diamond: Coins){
        Level_03.fieldCoins.push(diamond);
    }

    public shootWider(value:boolean) {
        this.wider=value;
    }

    public updateFrameColor(color){
        this.frame.setFillStyle(color,0.4);
    }

    public get getBossLives(): integer {
        return this.bosslives;
    }

    public get getWidthCounter(): integer {
        return this.widthCounter;
    }

    public get getSpeedCounter(): integer {
        return this.speedCounter;
    }

    public get getLevelScore(): integer {
        return this.score;
    }
}