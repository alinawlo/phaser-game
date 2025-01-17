import Phaser from 'phaser';
import LevelManager from './LevelManager';

export default class PauseScene extends Phaser.Scene {
    private static levelSceneKey: string;
    private score;
    private state;
    private heart;
    private coinsCollected;
    private enemiesKilled;
    private isTutorial;
    static sceneManager: Phaser.Scenes.SceneManager;


    constructor(score: number, state :number, hearts :number, coins :number, enemies :number, isTutorial: boolean) {
        super('pause-scene');
        this.score=score;
        this.state=state;
        this.heart=hearts;
        this.coinsCollected=coins;
        this.enemiesKilled=enemies;
        this.isTutorial = isTutorial;
    }

    init(data) {
        PauseScene.levelSceneKey = data.sceneKey;
        // Use the sceneKey as needed in the PauseScene
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const click = this.sound.add("click_s").setVolume(0.3)

        // Grey out game
        this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);
        // Add "Resume" button
        const resumeButton = this.add.text(width / 2 + 450, height / 2 - 180, 'Resume', {
            fontSize: '24px',
            color: '#fff',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);

        resumeButton.setInteractive();
        resumeButton.on('pointerdown', () => {
            click.play();
            this.resumeGame();
        });

        // Add "Restart" button
        const restartButton = this.add.text(width / 2 + 450, height / 2 - 130, 'Restart', {
            fontSize: '24px',
            color: '#fff',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);

        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            click.play();
            this.restartGame();
        });


        const levelManagerButton = this.add.text(width / 2 + 450, height / 2 - 80, "Level Manager", {
            fontSize: "24px",
            color: "#fff",
        })
            .setOrigin(0.5)
            .setDepth(1)
            .setInteractive();

        levelManagerButton.on("pointerdown", () => {
            click.play();
            PauseScene.sceneManager.pause(this.scene.key);
            PauseScene.sceneManager.remove('level-manager');
            PauseScene.sceneManager.add('level-manager', new LevelManager(this.scene.key));
            this.scene.launch("level-manager")
        });

        // Add a Home button
        const homeButton = this.add.text(width / 2 + 450, height / 2 -30 , "Home", {
            fontSize: "24px",
            color: "#fff",
        })
            .setOrigin(0.5)
            .setDepth(1)
            .setInteractive();

        homeButton.on("pointerdown", () => {
            click.play();
            this.scene.stop("level-manager");
            this.scene.stop("pause-scene");
            this.scene.stop(PauseScene.levelSceneKey);
            this.scene.start("home-scene");
        });

        if(this.isTutorial){
            const skipButton = this.add.text(width / 2 + 450, height / 2 + 20, 'Skip Tutorial', {
                fontSize: '24px',
                color: '#fff',
                padding: {
                    x: 10,
                    y: 5
                }
            }).setOrigin(0.5).setDepth(1);
    
            skipButton.setInteractive();
            skipButton.on('pointerdown', () => {
                this.scene.stop('level-00');
                this.scene.start("level-01");
            });
        }

        // Enable keyboard input
        const escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escapeKey.on('down', () => {
            if(this.scene.isPaused(PauseScene.levelSceneKey)){
                this.resumeGame();
            }
        });


        // Create Stats-table
        const statsData = [
            { name: 'Score:', value: this.score },
            { name: 'Current State:', value: this.state },
            { name: 'Lives:', value: this.heart },
            { name: 'Enemies Eliminated:', value: this.enemiesKilled },
        ];
        
        const table = this.add.graphics();
        const textStyle = {fontSize: "24px", color: '#ffffff' };
        
        // Draw table header
        table.fillStyle(0x336699, 1);
        table.fillRect(width / 2 - 300, height / 2 - 200, 530, 30);
        
        // Draw table rows
        statsData.forEach((row, index) => {
            const posY = height / 2 - 200 + 30 * (index + 1);
        
            table.fillStyle(0x000000, 1);
            table.fillRect(width / 2 - 300, posY, 530, 30);
        
            // Draw text in each cell
            this.add.text(width / 2 - 280, height / 2 - 197, "Game Stats:", textStyle);
            this.add.text(width / 2 - 280, posY + 10, row.name, textStyle);
            this.add.text(width / 2 + 200, posY + 10, String(row.value), textStyle);
        });
    }

    resumeGame() {
        this.scene.resume(PauseScene.levelSceneKey);
        this.scene.stop('pause-scene');
    }

    restartGame() {
        const levelScene = this.scene.get(PauseScene.levelSceneKey);
        levelScene.scene.restart();
        this.scene.stop('pause-scene');
    }

    public static get getLevelSceneKey(): string {
        return PauseScene.levelSceneKey;
    }

    static addScenes(sceneManager: Phaser.Scenes.SceneManager): void {
        this.sceneManager= sceneManager;
    }
}