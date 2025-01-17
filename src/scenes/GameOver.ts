import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {

    private levelSceneKey: string;

    constructor() {
        super('GameOver');
    }

    init(data){
        this.levelSceneKey = data.sceneKey;
    }
  
    create() {
        const click = this.sound.add("click_s").setVolume(0.3)
        // Add text to display "Game Over"
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.text(width / 2, height / 2 - 200, 'Game Over', { 
            fontSize: '32px', 
            color: '#fff', 
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);
        // Add Restart and Home button
        // Add "Restart" button
        const restartButton = this.add.text(width / 2, height / 2 - 100, 'Restart', {
            fontSize: '24px',
            color: '#fff',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);

        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            click.play()
            this.restartGame();
        });

        // Add a Home button
        const homeButton = this.add.text(width / 2, height / 2, "Home", {
            fontSize: "24px",
            color: "#fff",
        })
            .setOrigin(0.5)
            .setDepth(1)
            .setInteractive();

        homeButton.on("pointerdown", () => {
            click.play()
            this.scene.stop("level-manager");
            this.scene.stop("GameOver");
            this.scene.stop(this.levelSceneKey);
            this.scene.start("home-scene");
        });

    }

    restartGame() {
        this.scene.stop('GameOver');
        const levelScene = this.scene.get(this.levelSceneKey);
        levelScene.scene.restart();
    }
}