import Phaser from "phaser";

export default class EndScene extends Phaser.Scene {
    constructor() {
        super("end-scene");
    }

    create() {
        this.sound.add("win_s").setVolume(0.3).play();
        const congratulationsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Well done!',
            {
                fontSize: '64px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        const messageText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'You finished the game.\nThanks for playing!',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        const textStyle = {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        };

        const restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 150,
            'Click to restart',
            textStyle
        ).setOrigin(0.5).setInteractive();

        restartText.on('pointerdown', () => {
            this.scene.start('home-scene');
        });
    }
}
