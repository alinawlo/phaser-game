import Phaser from 'phaser';
import PauseScene from './PauseScene';
import Coins from '../objects/collectable/Coins';

export default class LevelManager extends Phaser.Scene {
    private levelSceneKey: string;
    private prevScenekey;
    private HS_player!: Phaser.Physics.Arcade.Sprite;

    constructor(scenekey) {
        super('level-manager');
        this.prevScenekey=scenekey
    }

    init(data) {
        this.levelSceneKey = data.sceneKey;
    }

    preload() {
        this.load.image("HS_player", "assets/level_1/idle01.png");
        this.load.spritesheet('HS_player_sheet', 'assets/level_1/move_sprite_1.png', {	
            frameWidth: 32, frameHeight: 38, spacing: 32	
        })
        this.load.image("level1", "assets/level1_button.png")
        this.load.image("level2", "assets/level2_button.png")
        this.load.image("level3", "assets/level3_button.png")
        
    }

    create() {
        // this.scene.start('level-01');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const click = this.sound.add("click_s").setVolume(0.3)

        // Grey out game
        this.add.rectangle(0, 0, width, height, 0x000000, (this.prevScenekey=="home-scene")? 0.8: 1).setOrigin(0);
        
        this.add.text(width / 2, height / 2 - 350, 'Choose a Level', {
            fontSize: '40px',
            color: '#fff',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);


        const level1 = this.add.image(window.innerWidth/2,window.innerHeight / 2-100, "level1");
        const level2 = this.add.image(window.innerWidth/2,window.innerHeight / 2, "level2");
        const level3 = this.add.image(window.innerWidth/2,window.innerHeight / 2+100, "level3");

        level1.setInteractive();
        level1.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = level1.x - level1.width;
            this.HS_player.y = level1.y;
        })
        level1.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        level1.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            if(this.prevScenekey=="pause-scene" && PauseScene.getLevelSceneKey=="level-01"){
                this.scene.stop(this.prevScenekey);
                this.scene.stop(this.scene.key);
                this.scene.resume(PauseScene.getLevelSceneKey)
            }else{
                this.scene.stop(this.prevScenekey)
                this.scene.stop(this.scene.key);
                this.scene.stop(PauseScene.getLevelSceneKey)
                this.scene.launch("level-01")
            }
        })

        level2.setInteractive();
        level2.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = level2.x - level2.width;
            this.HS_player.y = level2.y-5;
        })
        level2.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        level2.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            if(this.prevScenekey=="pause-scene" && PauseScene.getLevelSceneKey=="level-02"){
                this.scene.stop(this.prevScenekey);
                this.scene.stop(this.scene.key);
                this.scene.resume(PauseScene.getLevelSceneKey)
            }else{
                this.scene.stop(this.prevScenekey)
                this.scene.stop(this.levelSceneKey);
                this.scene.stop(PauseScene.getLevelSceneKey)
                this.scene.launch("level-02")
            }
        })
    
    

        level3.setInteractive();
        level3.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = level3.x - level3.width +20;
            this.HS_player.y = level3.y-5;
        })

        level3.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        level3.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            if(this.prevScenekey=="pause-scene" && PauseScene.getLevelSceneKey=="level-03"){
                this.scene.stop(this.prevScenekey);
                this.scene.stop(this.levelSceneKey);
                this.scene.resume(PauseScene.getLevelSceneKey)
            }else{
                this.scene.stop(this.prevScenekey)
                this.scene.stop(this.levelSceneKey);
                this.scene.stop(PauseScene.getLevelSceneKey)
                this.scene.launch("level-03")
            }
        })

        this.HS_player = this.physics.add.sprite(0, 0, "HS_player");        

        const backButton = this.add.text(width / 2 + 250, height / 2 + 200, "Back", {
            fontSize: "24px",
            color: "#fff",
        }).setOrigin(0.5).setDepth(1).setInteractive();

        backButton.on("pointerdown", () => {
            click.play();
            this.scene.pause(this.levelSceneKey);
            this.scene.stop(this.levelSceneKey);
            this.scene.start(this.prevScenekey);
        });
    }

    public static generateDiamond(scene: Phaser.Scene, Class: any) {
        const spawnPoint = LevelManager.generateRandomSpawnPoint(Class);

        let diamond;
    
        if (Math.random() > 0.5) {
            diamond = new Coins(scene, spawnPoint.x, 0, 'd');
            scene.physics.add.existing(diamond);
            diamond.body.velocity.y = 100;
    
            // Start the diamond falling animation
            scene.tweens.add({
                targets: diamond,
                y: spawnPoint.y,
                duration: 2000,
                ease: 'Linear',
                onComplete: () => {
                    if (diamond.body) {
                        diamond.body.velocity.y = 0;
                    }
                }
            });
        } else {
            diamond = new Coins(scene, (Math.random() > 0.5 ? 0 : window.innerWidth), spawnPoint.y, 'd');
            scene.physics.add.existing(diamond);
            diamond.body.velocity.x = (spawnPoint.x - diamond.x) / 2;
    
            // Start the diamond falling animation
            scene.tweens.add({
                targets: diamond,
                x: spawnPoint.x,
                duration: 2000,
                ease: 'Linear',
                onComplete: () => {
                    if (diamond.body) {
                        diamond.body.velocity.x = 0;
                    }
                }
            });
        }
        Class.updateField(diamond);
        diamond.setCollideWorldBounds(true);
        diamond.setBounce(0.5);
    }

    public static generateRandomSpawnPoint(Class:any) {
        const collisionLayerIndex = 0; // Modify this based on the index of your collision layer
        const collisionLayer = Class.map.layers[collisionLayerIndex];
        let spawnPoint

        let findingPoints = true
        while(findingPoints) {
            const spawnX = Phaser.Math.Between(Class.map.width *0.1, Class.map.width *0.9);
            const spawnY = Phaser.Math.Between(Class.map.height *0.1, Class.map.height *0.9);
            const tile = collisionLayer.data[spawnY][spawnX];

            if (!tile.collides) {
                spawnPoint = Class.map.tileToWorldXY(spawnX, spawnY);
                findingPoints= false
            }
        }
        return spawnPoint
    }

    public static diamondCollected(scene){
        const collecting = scene.sound.add("coin_s").setVolume(0.1)
        collecting.play();
        const tempState= scene.state;
        scene.state = scene.MDP.MDPcheck(scene.Action1);
        scene.hud.updateState(scene.state);
        scene.pauseButton.updateStateValue(scene.state);
        if(tempState.name!=scene.state.name){
            LevelManager.decidePowerup(scene, scene.state)
        }

        scene.hud.updateScore(++scene.score);
        scene.pauseButton.updateScoreValue(scene.score);
        scene.generate=true;
        scene.MdpGraph.updateNodeColors();
        if(scene.heart<3){
            scene.MdpGraph.showHealthNode();
        }
    }

    public static decidePowerup(scene, state){
        const powerup = scene.sound.add("powerup_s").setVolume(0.1)
        powerup.play();
        
        if ((scene.scene.key=="level-01" && state.name=="A") 
        || (scene.scene.key=="level-02" && state.name=="G")
        || (scene.scene.key=="level-03" && state.name=="D" && scene.getBossLives>1)){
            if(scene.heart<3 && (  Math.random() > 0.5)){
                scene.hud.updateHeart(++scene.heart);
            }
            scene.pauseButton.updateHeartsValue(scene.heart);
        } else if (state.name=="B" && scene.widthCounter<4){
            scene.wider = true;
            scene.widthCounter++;    
        } else if ((scene.scene.key=="level-01" && state.name=="C") 
        || (scene.scene.key=="level-02" && state.name=="E")
        || (scene.scene.key=="level-03" && state.name=="C")){

            if(scene.speedCounter<4){
                scene.player.increaseSpeed();
                scene.speedCounter++;    
            }
        }
    }
}







