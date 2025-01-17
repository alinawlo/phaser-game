import Player from '../../objects/player/Player';
import HUD from '../HUD';
import Enemy from '../../objects/enemy/Enemy';
import Coins from '../../objects/collectable/Coins';
import PauseButton from '../PauseButton';
import MDP from '../../MDP';
import CreateMap from '../../CreateMap';
import State from '../../State';
import MdpGraph from '../../MdpGraph';


export default class Level_00 extends Phaser.Scene {
    private fadeOutTween!: Phaser.Tweens.Tween;
    private player: Player;
    private enemy: Enemy[] = [];
    private hud!: HUD;
    private pauseButton!: PauseButton;
    private collectable;
    private gameIsOver;
    private exit;
    private levelFinished;
    private collectedCoins: Coins[] = [];
    private MDP!: MDP;
    private map;
    private state;
    private laststate;
    private heart;
    private score;
    private layer;
    private coinsCollected = 0;
    private enemiesKilled = 0;
    private readonly map_w = 1920;
    private readonly map_h = 1080;
    private checkText: Phaser.GameObjects.Text[] = [];
    private tutorialText: Phaser.GameObjects.Text
    private tutorialState = 0;
    private Action1;
    private Action2;
    private MdpGraph;
    private overlapActive: boolean; 
    private gate=0;
    private frame;
    private buttonPressedTut = {
        up: false,
        left: false,
        right: false,
        space: false
    };

    preload() {
        //bg
        this.load.image('bg0', 'assets/level_0/B.png');
        //enemies
        this.load.image('mushroom', 'assets/enemies/Mushroom/Mushroom_Idle2.png');
    }

    constructor() {
        super('level-00');
    }

    create() {
        const start = this.sound.add("start_s").setVolume(0.1)
        start.play()
        this.add.image(0,0, "bg0").setDisplaySize(this.map_w,this.map_h).setOrigin(0).setDepth(-3);

        const checkTextConfig = [
            { offsetX: -217.5, offsetY: 200, text: '↑'},
            { offsetX: -375, offsetY: 200, text: '←' },
            { offsetX: -317.3, offsetY: 200, text: '→' },
            { offsetX: 95, offsetY: 200, text: 'spacebar' }
        ];

        checkTextConfig.forEach(config => {
            const checkText = this.add.text(
                this.cameras.main.width / 2 + config.offsetX,
                this.cameras.main.height / 2 - config.offsetY,
                config.text,
                { fontSize: "20px",  backgroundColor: "black", fontFamily: "Comic Sans", }
            ).setDepth(2).setScrollFactor(0.01, 0.01);
            checkText.setVisible(false)
            this.checkText.push(checkText);
        });

        this.tutorialText = this.add.text(this.cameras.main.width/2-500, this.cameras.main.height / 2 - 200, "", {
            fontSize: "20px",
            color: "#ffffff",
            align: "center",
            backgroundColor: "black",
            fontFamily: "Comic Sans",
        }).setDepth(1).setScrollFactor(0.01, 0.01);

        //create map with its layers
        const map = CreateMap.createMap(this,0);
        const layer = CreateMap.createLayers(map, 0);
        this.layer = layer;

        //create enemies
        this.enemy.push(new Enemy(this, this.layer.enemy_spawns.objects[0].x, this.layer.enemy_spawns.objects[0].y, 500, 0, 'mushroom'));
        
        //create player on startZone 
        this.player = new Player(this, this.layer.playerZones.objects[0].x, this.layer.playerZones.objects[0].y);

        //get collectables from layer  
        this.collectable = this.physics.add.staticGroup(); // Initialize as a StaticGroup
        this.collectable = CreateMap.getCollectables(this, this.layer.collectables);

        this.setCollider(this.layer.platformsColliders, this.layer.platformsCollidersEnemeies);
        this.overlapActive = true;
        this.setOverlap();

        this.gameIsOver = false;
        this.heart = 3;
        this.score = 0;
        this.coinsCollected=0;
        this.enemiesKilled=0;

        this.drawMdpGraph();

        // pauseButton
        this.pauseButton = new PauseButton(this, this.scene.key, this.state, true, 480);
        this.hud = new HUD(this, this.state);

        this.setupCamera(this.player);
        this.createEndOfLevel();

    }

    drawMdpGraph(){
        // Creating States with Transitions

        this.Action1 = "diamond";
        this.Action2 = "iceball";
        const width = this.cameras.main.width;
        this.state = new State(["A"],{x: width-370,y: 100});
        this.laststate = this.state;
        const stateC = new State(["C","mdpportal0"],{x: width-120,y: 100});

        this.MDP = new MDP(this.state, stateC);
        this.MdpGraph = new MdpGraph(this, this.MDP);
        // draw background
        const border1 = this.add
            .rectangle(width - 450, 20, 430, 180, 0xffffff, 0.3)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.MdpGraph.elements.push(border1);
        const border2 = this.add
            .rectangle(width - 460, 10, 450, 200, 0x000000, 0.4)
            .setOrigin(0)
            .setScrollFactor(0.01, 0.01);
        this.frame=border2;
        this.MdpGraph.elements.push(border2);
        this.MdpGraph.createNodes(10);
        this.MDP.readfile("./assets/level_0/MDPGraph.txt", width, this.MdpGraph);
    

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
                const hit = this.sound.add("hit_s").setVolume(0.1)
                hit.play()
                this.hud.updateHeart(--this.heart);
                this.pauseButton.updateHeartsValue(this.heart);
                if (this.heart == 0) {
                    this.gameIsOver = true;
                    const death = this.sound.add("death_s").setVolume(0.1)
                    death.play();
                }
                this.player.loseLife();
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
                const kill = this.sound.add("kill_s").setVolume(0.1)
                kill.play();
                this.player.shoot(enemy, items);
                this.pauseButton.updateEnemiesKilled(++this.enemiesKilled);
                this.state = this.MDP.MDPcheck(this.Action2);
                this.MdpGraph.updateNodeColors();
                this.hud.updateState(this.state);
                this.pauseButton.updateStateValue(this.state);
            }
        });


        this.physics.add.overlap(this.player, this.collectable, (_player, collectables) => {
            if (this.overlapActive) {
                this.player.onCollect(collectables);
                const collecting = this.sound.add("coin_s").setVolume(0.1)
                collecting.play();
                const tempState= this.state;
                this.state = this.MDP.MDPcheck(this.Action1);
                if(tempState!=this.state){
                    this.player.increaseSpeed();
                    const powerup = this.sound.add("powerup_s").setVolume(0.1)
                    powerup.play();
                }
                this.MdpGraph.updateNodeColors();
                this.hud.updateState(this.state);
                this.pauseButton.updateStateValue(this.state);
                this.hud.updateScore(++this.score);
                this.pauseButton.updateScoreValue(this.score);
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
            key: 'portal0',
            frames : this.anims.generateFrameNumbers('portal0',{start: 0, end: 6}),
            frameRate: 5,
            repeat: -1
        })
   
        this.exit = this.physics.add.sprite(this.layer.playerZones.objects[1].x, this.layer.playerZones.objects[1].y, 'end');
        this.exit.setVisible(false);
        
        this.physics.add.overlap(this.player, this.exit, () => {
            if (this.MDP.getCurrentState() === this.MDP.getGoalState()){
                this.levelFinished = true;
            }
        })
    }
    update(timer, delta) {
        this.player.update();
        this.enemy.forEach((e) => {
            e.update(timer, delta);
            return null;
        });
        switch (this.tutorialState) {
            case 0: {
                this.tutorialText.setText("Welcome to the Marvels of the Distorted Path tutorial! The goal of the game is to solve the MDP and reach the target state.\n Collect coins and eliminate enemies to enable state transitions.");
                this.input.keyboard.removeAllListeners()
                this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () => {
                    this.tutorialState = 1;
                })
                break;
            }
            case 1: {
                this.tutorialText.setText("Basic controls: ← and → to move, ↑ to jump (2 times for a double jump), spacebar to shoot. Try it out.")
                this.input.keyboard.removeAllListeners()
                const keys = {
                    up: ['Up', 'W'],
                    left: ['Left', 'A'],
                    right: ['Right', 'D'],
                    space: ['Space']
                };
                const { up, left, right, space } = keys;
                this.buttonPressedTut.up = up.some(key => this.input.keyboard.addKey(key).isDown) || this.buttonPressedTut.up;
                this.buttonPressedTut.left = left.some(key => this.input.keyboard.addKey(key).isDown) || this.buttonPressedTut.left;
                this.buttonPressedTut.right = right.some(key => this.input.keyboard.addKey(key).isDown) || this.buttonPressedTut.right;
                this.buttonPressedTut.space = this.input.keyboard.addKey(space[0]).isDown || this.buttonPressedTut.space;

                const buttonToCheckTextMap = {
                    up: this.checkText[0],
                    left: this.checkText[1],
                    right: this.checkText[2],
                    space: this.checkText[3]
                };

                Object.entries(buttonToCheckTextMap).forEach(([button, checkText]) => {
                    if (this.buttonPressedTut[button]) {
                        checkText.setVisible(true)
                        checkText.setColor('Green');
                    }
                });
                  
                if (this.checkText.every(checkText => checkText.style.color === "Green")) {
                    this.tutorialState = 2;
                    this.checkText.forEach(checkText => {
                        checkText.setText("");
                    });
                }

                break;
            }
            case 2: {
                this.tutorialText.setText("We are in State A and need to get to State C. To do this, we must first collect a coin,\n in order to reach State B. Give it a try!")
                this.input.keyboard.removeAllListeners()
                if (this.state.name === 'B') {
                    this.tutorialState = 3;
                }
                break;
            }
            case 3: {
                //this.tutorialText.setPosition(this.cameras.main.width/2-350, this.cameras.main.height/2-200)
                this.tutorialText.setText("Well done. We are now in State B. You also get a power-up when you reach certain states.")
                this.input.keyboard.removeAllListeners()
                this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () => {
                    this.tutorialState = 4;
                })
                break
            }
            case 4: {
                this.input.keyboard.removeAllListeners()
                //this.tutorialText.setPosition(this.cameras.main.width/2-350, this.cameras.main.height/2-200)
                this.tutorialText.setText("Now we need to transition to the target state. Try it yourself now. Tip: Try to shoot down the opponent.")
                if (this.state.name === 'C') {
                    this.tutorialState = 5;
                }
                break;
            }
            case 5: {
                this.tutorialText.setText("Great! You have managed to reach the target state C. This unlocks the exit of the level and you can complete the level.")
                break;
            }
            default: {
                break
            }
        }
        if (this.MDP.getCurrentState() == this.MDP.getGoalState()) {
            this.exit.setVisible(true);
            if(this.gate==0){
                const door = this.sound.add("door_s").setVolume(0.5)
                door.play();
                this.gate++;
            }
            this.exit.play('portal0',true);
        }
        if (this.gameIsOver) {
            this.scene.pause(this.scene.key);
            this.scene.start('GameOver', { sceneKey: this.scene.key });
        }
        if (this.levelFinished) {
            this.levelFinished = false;

            this.fade();

            this.time.delayedCall(4000, () => {
                this.scene.stop('level-00');
                this.scene.launch('transition-scene');

                this.scene.get('transition-scene').events.once('next', () => {
                    this.scene.stop('transition-scene');
                    this.scene.start('level-01');
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
    }

    public updateFrameColor(color){
        this.frame.setFillStyle(color,0.4);
    }
}
