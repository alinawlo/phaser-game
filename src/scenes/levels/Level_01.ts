/* import Phaser, { Create } from 'phaser'; */
import Player from '../../objects/player/Player';
import HUD from '../HUD';
import Enemy from '../../objects/enemy/Enemy';
import FlyingEnemy from '../../objects/enemy/FlyingEnemy';
import Coins from '../../objects/collectable/Coins';
import PauseButton from '../PauseButton';
import MDP from '../../MDP';
import CreateMap from '../../CreateMap';
import State from '../../State';
import MdpGraph from '../../MdpGraph';
import LevelManager from '../LevelManager';
import Attacks from '../../objects/attack/Attacks';


export default class Level_01 extends Phaser.Scene {
    private fadeOutTween!: Phaser.Tweens.Tween;
    private player: Player;
    private enemy: Enemy[] = [];
    private hud!: HUD;
    private pauseButton!: PauseButton;
    private collectable;
    private gameIsOver;
    private exit;
    private levelFinished;
    private static fieldCoins: Coins[] = [];
    private MDP!: MDP;
    public static map;
    private state;
    private laststate;
    private heart;
    private score;
    private layer;
    private coinsCollected;
    private enemiesKilled;
    private enemyLocation = [0, 2];
    private flyingEnemyLocation = [3, 1];
    private readonly map_w = 1920;
    private readonly map_h = 1280;
    private generate;
    private Action1;
    private Action2;
    private MdpGraph;
    private wider: boolean;
    private overlapActive: boolean;
    private states: State[]=[];
    private speedCounter=0
    private widthCounter=0
    private gate =0;
    private frame;

    constructor() {
        super('level-01');
    }

    preload() {
        //enemies
        this.load.image('mushroom', 'assets/enemies/Mushroom/Mushroom_Idle2.png');
        this.load.image('eye', 'assets/enemies/Flying eye/Idle.png');
    }

    create() {
        const start = this.sound.add("start_s").setVolume(0.1)
        start.play()
        
        this.add.image(0,0, "bg_1").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-3);
        //create map with its layers
        const map = CreateMap.createMap(this, 1);
        this.layer = CreateMap.createLayers(map, 1);
        Level_01.map = map;

        //create enemies
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[0].x, this.layer.enemy_spawns.objects[0].y, 500, 0, 'mushroom'));
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[2].x, this.layer.enemy_spawns.objects[2].y, 500, 1, 'mushroom'));
        this.enemy.push(new FlyingEnemy(this, this.layer.enemy_spawns.objects[1].x,this.layer.enemy_spawns.objects[1].y, 0, 1000, 0, 'eye'));
        this.enemy.push(new FlyingEnemy(this, this.layer.enemy_spawns.objects[3].x, this.layer.enemy_spawns.objects[3].y, 0, 2000, 1, 'eye'));
        
        //create player on startZone 
        this.player = new Player(this, this.layer.playerZones.objects[0].x, this.layer.playerZones.objects[0].y);

        //get collectables from layer  
        this.collectable = this.physics.add.staticGroup(); // Initialize as a StaticGroup
        this.collectable = CreateMap.getCollectables(this, this.layer.collectables);

        //get exit from layer
        this.createEndOfLevel();


        this.setCollider(this.layer.platformsColliders, this.layer.platformsCollidersEnemeies);
        this.overlapActive = true;
        this.setOverlap();

        this.gameIsOver = false;
        this.heart = 3;
        this.score = 0;
        this.coinsCollected=0;
        this.enemiesKilled=0;
        this.wider=false;

        this.drawMdpGraph();
        // pauseButton
        this.pauseButton = new PauseButton(this, this.scene.key, this.state, false, 380);
        this.hud = new HUD(this, this.state);

        // this.MdpGraph.addEdge(stateA,stateA,4);
        this.setupCamera(this.player);

        Attacks.intitializeShotwidth(150);
    }

    drawMdpGraph(){
        // Creating States with Transitions
        this.Action1 = "diamond";
        this.Action2 = "iceball";
        const width = this.cameras.main.width;
        this.state = new State(["A","extra"],{x: width-270,y: 100});
        this.laststate = this.state;
        const stateD = new State(["D","mdpportal"],{x: width-120,y: 100});

        this.MDP = new MDP(this.state, stateD);
        this.MdpGraph = new MdpGraph(this, this.MDP);
        // draw background
        const border1 = this.add
            .rectangle(width - (330+20), 20, 330, 300, 0xffffff, 0.3)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.MdpGraph.elements.push(border1);
        const border2 = this.add
            .rectangle(width - (330+30), 10, (330+20), (300+20), 0x000000, 0.4)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.frame=border2;
        this.MdpGraph.elements.push(border2);
        this.MdpGraph.createNodes(430);
        this.MDP.readfile("./assets/level_1/MDPGraph.txt", width, this.MdpGraph);
        
        const showMdpButton = this.add.text(window.innerWidth - 470, 30, "Hide MDP |", {
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
     * set a zoom camera and follow the player
     * @param player 
     */
    setupCamera(player){
        this.physics.world.setBounds(0, 0, this.map_w, this.map_h);
        this.cameras.main.setBounds(0, 0, this.map_w, this.map_h);
        this.cameras.main.startFollow(player);
    }

    /**
     * set collider between enemy/player and platforms
     */
    setCollider(platformsColliders, platformsCollidersEnemeies) {

        this.physics.add.collider(this.enemy, platformsCollidersEnemeies);
            
        this.physics.add.collider(this.player, platformsColliders);

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
     * set up overlap between objects (enemy,iceball) ,(player,diamond), (enemy,player), (player,exit)
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

                this.hud.updateHeart(--this.heart);
                this.pauseButton.updateHeartsValue(this.heart);
                if(this.heart<3){
                    this.MdpGraph.showHealthNode();
                }                if (this.heart == 0) {
                    this.gameIsOver = true;
                    const death = this.sound.add("death_s").setVolume(0.1)
                    death.play();
                }
                this.player.loseLife();
                const hit = this.sound.add("hit_s").setVolume(0.1)
                hit.play();

                if(this.heart>0){
                    this.scene.launch('DamageScene', { sceneKey: this.scene.key, heartCount: this.heart, player: this.player })
                    this.makePlayerBlink()
                }
                // Block the code
                blockCodeForDuration(15);
            }
        });


        this.physics.add.overlap(this.enemy, this.player.GroupAttacks, (enemy, items) => {
            if (this.overlapActive) {
                if (!(enemy as Enemy).getIsActive()) {
                    return
                }
                this.player.shoot(enemy, items);
                this.pauseButton.updateEnemiesKilled(++this.enemiesKilled);
                if (enemy instanceof FlyingEnemy) {
                    this.flyingEnemyLocation = enemy.spawnRandomPos(this.layer.FlyEnemyRandomSpawns.objects, this.flyingEnemyLocation, 0)
                } else {
                    this.enemyLocation = (enemy as Enemy).spawnRandomPos(this.layer.enemyRandomSpawns.objects, this.enemyLocation, 0)
                }
                const kill = this.sound.add("kill_s").setVolume(0.1)
                kill.play();
                const tempState= this.state;
                this.state = this.MDP.MDPcheck(this.Action2);
                this.MdpGraph.updateNodeColors();
                if(this.heart<3){
                    this.MdpGraph.showHealthNode();
                }
                this.hud.updateState(this.state);
                this.pauseButton.updateStateValue(this.state);
                if(tempState.name!=this.state.name){
                    LevelManager.decidePowerup(this,this.state)
                } 
            }
        });

        this.physics.add.overlap(this.player, this.collectable, (_player, collectables) => {
            if (this.overlapActive) {
                this.player.onCollect(collectables);
                LevelManager.diamondCollected(this);
            }
        });

        this.physics.add.overlap(this.player, Level_01.fieldCoins, (_player, coin) => {
            if (this.overlapActive) {
                const collectedCoin = coin as Coins;
                this.player.onCollect(collectedCoin);
                LevelManager.diamondCollected(this);
                const index = Level_01.fieldCoins.indexOf(collectedCoin);
                // Remove the coin from the fieldCoins array
                if (index > -1) {
                    Level_01.fieldCoins.splice(index, 1);
                }
            }
        });

        this.physics.add.overlap(this.player, this.exit, () => {
            if (this.overlapActive && this.MDP.getCurrentState() == this.MDP.getGoalState()) {
                this.overlapActive = false;
                this.levelFinished = true;
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
    createEndOfLevel() {
        this.anims.create({
            key: 'portal',
            frames : this.anims.generateFrameNumbers('portal',{start: 0, end: 5}),
            frameRate: 5,
            repeat: -1
        })
   
        this.exit = this.physics.add.sprite(this.layer.playerZones.objects[1].x-10, this.layer.playerZones.objects[1].y-50, 'end');
        this.exit.setVisible(false);
        this.physics.add.overlap(this.player, this.exit, () => {
            if (this.MDP.getCurrentState() === this.MDP.getGoalState()){
                this.levelFinished = true;
            }
        })
    }

    update(timer, delta) {
        this.player.update();
        Attacks.intitializeShotSpeed(Player.getPlayerSpeed+200)
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
            this.exit.play('portal', true);
        }
        if (this.levelFinished) {
            this.levelFinished = false;

            this.fade();

            this.time.delayedCall(4000, () => {
                this.scene.stop('level-01');
                this.scene.launch('transition-scene');

                this.scene.get('transition-scene').events.once('next', () => {
                    this.scene.stop('transition-scene');
                    this.scene.start('level-02');
                });
                this.scene.get('transition-scene').events.once('home', () => {
                    this.scene.stop('transition-scene');
                    this.scene.start('home-scene');
                });
            }, [], this);
        }
        // Handle collision and scoring logic here

        while ((this.collectable.countActive()+Level_01.fieldCoins.length) === 0) {
            // Generate new diamonds
            if(this.generate){
                LevelManager.generateDiamond(this,Level_01);
                this.generate=false;
            } 
        }

        if(this.laststate != this.state){
            this.player.showStateAdvancement();
            this.laststate = this.state;
        }
    }

    public get widerShots(): boolean {
        return this.wider;
    }

    public static updateField(diamond: Coins){
        Level_01.fieldCoins.push(diamond);
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
