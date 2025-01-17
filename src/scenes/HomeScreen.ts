import Phaser from "phaser";
import LevelManager from "./LevelManager";
import StoryScene from "./StoryScene";

export default class HomeScene extends Phaser.Scene {
    private HS_player!: Phaser.Physics.Arcade.Sprite;
    static sceneManager: Phaser.Scenes.SceneManager;

    constructor() {
        super("home-scene");
    }

    preload() {
        this.load.image("HS_player", "assets/level_1/idle01.png");
        this.load.image("heart", "assets/heart.png")
        this.load.image("heartBig", "assets/heartBig.png")
        this.load.spritesheet('HS_player_sheet', 'assets/level_1/move_sprite_1.png', {	
            frameWidth: 32, frameHeight: 38, spacing: 32	
        })	
        this.load.image("title_bg", "assets/title_bg.png");
        this.load.image("title_bg3", "assets/title_bg3.png");
        this.load.image("play_button", "assets/play_button.png");
        this.load.image("tutorial_button", "assets/tutorial_button.png");
        this.load.image("title", "assets/title.png");
        this.load.image("level_manager", "assets/level_manger_button.png");
        this.load.image("story_button", "assets/story_button.png");

    }

    create() {
        this.add.image(0,0, "title_bg").setDisplaySize(window.innerWidth,window.innerHeight ).setOrigin(0).setDepth(-1);
        this.add.image(0,0, "title_bg3").setDisplaySize(window.innerWidth,window.innerHeight ).setOrigin(0).setDepth(-2);
        this.add.image(window.innerWidth/2,window.innerHeight/3, "title")
        
        const playButton = this.add.image(window.innerWidth/2,window.innerHeight / 2, "play_button");
        const levelManagerButton = this.add.image(window.innerWidth/2,window.innerHeight / 2 + 200, "level_manager");
        const tutorialButton = this.add.image(window.innerWidth/2,window.innerHeight / 2 + 100, "tutorial_button");
        const storyButton = this.add.image(window.innerWidth/2,window.innerHeight / 2 + 300, "story_button");

        const click = this.sound.add("click_s").setVolume(0.3)

        playButton.setInteractive();
        playButton.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = playButton.x - playButton.width;
            this.HS_player.y = playButton.y;
        })
        playButton.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            this.scene.start("level-01")
        })

        tutorialButton.setInteractive();
        tutorialButton.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = tutorialButton.x - tutorialButton.width;
            this.HS_player.y = tutorialButton.y-5;
        })
        tutorialButton.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        tutorialButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            this.scene.start("level-00")
        })
    
    

        levelManagerButton.setInteractive();
        levelManagerButton.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = levelManagerButton.x - levelManagerButton.width +20;
            this.HS_player.y = levelManagerButton.y-5;
        })

        levelManagerButton.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })
        
        levelManagerButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            this.scene.pause("home-scene")
            HomeScene.sceneManager.remove('level-manager');
            HomeScene.sceneManager.add('level-manager', new LevelManager(this.scene.key));
            this.scene.launch("level-manager")
        })


        storyButton.setInteractive();
        storyButton.on("pointerover", () => {
            this.HS_player.setVisible(true);
            this.HS_player.anims.play("run", true);
            this.HS_player.x = storyButton.x - storyButton.width +20;
            this.HS_player.y = storyButton.y-5;
        })

        storyButton.on("pointerout", () => {
            this.HS_player.setVisible(false);
        })

        storyButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, ()=>{
            click.play();
            this.scene.start('story')
        })


        this.HS_player = this.physics.add.sprite(0, 0, "HS_player");
        this.anims.create({
            key : 'run',
            frames: this.anims.generateFrameNumbers('HS_player_sheet',{start:11,end:16}),
            frameRate: 12,
            repeat: -1
        })

    }

    static addScenes(sceneManager: Phaser.Scenes.SceneManager): void {
        this.sceneManager= sceneManager;
    }

}
