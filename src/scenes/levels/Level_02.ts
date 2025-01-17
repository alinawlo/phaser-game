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
import Attacks from '../../objects/attack/Attacks';



export default class Level_02 extends Phaser.Scene {
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
    private frame;


    constructor() {
        super('level-02');
    }
    preload() {
        //background
        this.load.image('bg', 'assets/level_2/bg-mountains.png');
        this.load.image('moon', 'assets/level_2/bg-moon.png');
        //enemies
        this.load.image('enemy2', 'assets/level_2/atlas.png');
        this.load.image('enemy1','assets/level_2/atlasq.png');
    }

    create() {
        const start = this.sound.add("start_s").setVolume(0.1)
        start.play()
        this.hitsound = this.sound.add("hit_s").setVolume(0.1)
        //create map with its layers
        const map = CreateMap.createMap(this,2);
        this.layer = CreateMap.createLayers(map,2);
        Level_02.map = map; 
        const collisionlayer = this.modifyMap(map);

        //create enemies
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[0].x, this.layer.enemy_spawns.objects[0].y, 500, 0, 'enemy2'));
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[2].x, this.layer.enemy_spawns.objects[2].y, 500, 1, 'enemy2'));
        this.enemy.push(new FlyingEnemy(this, this.layer.enemy_spawns.objects[1].x,this.layer.enemy_spawns.objects[1].y, 0, 1000, 0,'enemy1'));
        this.enemy.push(new FlyingEnemy(this, this.layer.enemy_spawns.objects[3].x, this.layer.enemy_spawns.objects[3].y, 0, 2000, 1, 'enemy1'));

        //create player on startZone 
        this.player = new Player(this, this.layer.playerZones.objects[0].x, this.layer.playerZones.objects[0].y);

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

        this.pauseButton = new PauseButton(this, this.scene.key, this.state, false, 480);
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
        this.state = new State(["A"],{x: width-370,y: 100});
        this.laststate = this.state;
        const stateH = new State(["H","mdpportal2"],{x: width-70,y: 100});
        
        // Create MDP and add states
        this.MDP = new MDP(this.state ,stateH);
        this.MdpGraph = new MdpGraph(this, this.MDP);   
        // draw background
        const border1 = this.add
            .rectangle(width - (430+20), 20, 430, 250, 0xffffff, 0.5)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.MdpGraph.elements.push(border1);
        const border2 = this.add
            .rectangle(width - (430+30), 10, (430+20), (250+20), 0x000000, 0.6)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.frame=border2;
        this.MdpGraph.elements.push(border2);
        this.MdpGraph.createNodes(430);
        this.MDP.readfile("./assets/level_2/MDPGraph.txt", width, this.MdpGraph);
        

        const showMdpButton = this.add.text(window.innerWidth - 570, 30, "Hide MDP |", {
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
        showMdpButton.on("pointerdown", toggleMdpVisibility, this);
        
        // Event listener for 'm' key press
        this.input.keyboard.on("keydown-M", toggleMdpVisibility, this);
        
        // Hover effect
        showMdpButton.on("pointerover", () => {
            showMdpButton.setStyle({ fill: "#f00" });
        });
        
        showMdpButton.on("pointerout", () => {
            showMdpButton.setStyle({ fill: "#fff" });
        });
    }

    /**
     *  this function create background
     */
    createBackGround(){
        this.add.image(0,0, "bg").setDisplaySize(this.map_w,this.map_h*1.7).setOrigin(0).setDepth(-3);
        this.add.image(0,0, "moon").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-4);
    }

    /**
     * this function modify map and create new layer for this level
     * @param map 
     */
    modifyMap(map: Phaser.Tilemaps.Tilemap){
        const platforms_collision = map.createLayer('platforms_collision', 'tiles-2').setDepth(-5);
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
            if (this.MDP.getCurrentState() === this.MDP.getGoalState()){
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
     *  this function check if the current state is a sink
     */
    checkSink( s: State){
        if(s.name == 'F'){
            return true;
        }
        return false;
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
        } else {
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
                const tempState= this.state;
                this.updateStateOfEnemies(enemy, items);
                this.state = this.MDP.MDPcheck(this.Action2);
                this.MdpGraph.updateNodeColors();
                this.updateState();
                if(tempState.name!=this.state.name){
                    LevelManager.decidePowerup(this,this.state)
                } 
                if (isCodeRunnable && this.checkSink(this.state)) {
                    this.updateHeart();
                    this.hitsound.play();
                    this.state = this.MDP.states['A'];
                    this.MDP.setCurrentState(this.state);
                    this.MdpGraph.updateNodeColors();
                    this.updateState();
                    blockCodeForDuration(15);
                }
            }
        });

        this.physics.add.overlap(this.player, this.collectable, (_player, collectables) => {
            if (this.overlapActive) {
                this.player.onCollect(collectables);
                LevelManager.diamondCollected(this);
            }
        });

        this.physics.add.overlap(this.player, Level_02.fieldCoins, (_player, coin) => {
            if (this.overlapActive) {
                const collectedCoin = coin as Coins;
                this.player.onCollect(collectedCoin);
                LevelManager.diamondCollected(this);
                const index = Level_02.fieldCoins.indexOf(collectedCoin);
                // Remove the coin from the fieldCoins array
                if (index > -1) {
                    Level_02.fieldCoins.splice(index, 1);
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

        if (this.MDP.getCurrentState() == this.MDP.getGoalState()) {
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
                this.scene.stop('level-02');
                this.scene.launch('transition-scene');

                this.scene.get('transition-scene').events.once('next', () => {
                    this.scene.stop('transition-scene');
                    this.scene.start('level-03');
                });
                this.scene.get('transition-scene').events.once('home', () => {
                    this.scene.stop('transition-scene');
                    this.scene.start('home-scene');
                });
            }, [], this);
        }
        if(this.laststate != this.state){
            this.player.showStateAdvancement();
            this.laststate = this.state;
        }
        // Handle collision and scoring logic here
        while ((this.collectable.countActive()+Level_02.fieldCoins.length) === 0) {
            // Generate new diamonds
            if(this.generate){
                LevelManager.generateDiamond(this,Level_02);
                this.generate=false;
            } 
        }
    }

    public get widerShots(): boolean {
        return this.wider;
    }

    public static updateField(diamond: Coins){
        Level_02.fieldCoins.push(diamond);
    }

    public shootWider(value:boolean) {
        this.wider=value;
    }

    public updateFrameColor(color){
        this.frame.setFillStyle(color,0.4);
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
