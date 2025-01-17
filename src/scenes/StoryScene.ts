import Phaser from 'phaser';
import PauseScene from './PauseScene';

export default class LevelManager extends Phaser.Scene {

    constructor(scenekey) {
        super('story');
    }


    create() {
        // this.scene.start('level-01');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.text(width / 2, height / 2 - 350, 'Story', {
            fontSize: '40px',
            color: '#fff',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);

        const fontS = (this.cameras.main.width / 80).toString() + 'px'
        this.add.text(width / 2, height / 2, "In a shattered reality, an evil wizard uses his powers to manipulate fate and ensnare every being and thing that roams it.\n Only Linda possesses the ability to perceive the hidden MDP he had created to achieve his goals.\n \n  Guided by an unseen force, Linda embarks on a treacherous journey, navigating the MDP.\n Each step she takes altered the future, changing destinies and freeing those held captive by the evil wizards influence.\n As she progresses, Linda tries to weave around the traps the evil wizard has put in her way.\n An arrangement of increasingly difficult situations suspended in reality, waiting for her to fall into.\n Her only support being artifacts the evil wizard lost there as he was creating the MDP.\n \n State by state Linda advances towards the evil wizards lair in hopes of defeating him at his own game.", {
            fontSize: fontS,
            color: '#fff',
            align: "center",
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5).setDepth(1);

        const click = this.sound.add("click_s").setVolume(0.3)

        const backButton = this.add.text(width / 2 + 250, height / 2 + 200, "Back", {
            fontSize: "24px",
            color: "#fff",
        }).setOrigin(0.5).setDepth(1).setInteractive();

        backButton.on("pointerdown", () => {
            click.play();
            this.scene.start('home-scene');
        });
    }
}







