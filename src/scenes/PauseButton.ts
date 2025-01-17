import Phaser from "phaser";
import PauseScene from "./PauseScene";
import State from "../State";

export default class PauseButton {
    private scoreValue=0;
    private stateValue;
    private heartsValue =3;
    private coinsCollected =0;
    private enemiesKilled =0;


    static sceneManager: Phaser.Scenes.SceneManager;

    static addScenes(sceneManager: Phaser.Scenes.SceneManager): void {
        this.sceneManager= sceneManager;
    }

    constructor(scene: Phaser.Scene, sceneKey, state, isTutorial, offsetX) {
        this.stateValue = state.name;
        const click = scene.sound.add("click_s").setVolume(0.3)
        
        const pauseButton = scene.add.text(window.innerWidth - offsetX, 30, "Pause", {
            fontSize: "24px",
            color: "#fff",
        }).setOrigin(1, 0).setDepth(1);
        pauseButton.setInteractive();
        pauseButton.scrollFactorX = 0.01;
        pauseButton.scrollFactorY = 0.01;
        
        pauseButton.on("pointerdown", () => {
            click.play();
            scene.scene.pause(sceneKey);
            PauseButton.sceneManager.remove('pause-scene');
            PauseButton.sceneManager.add('pause-scene', new PauseScene(this.scoreValue,this.stateValue,this.heartsValue,this.coinsCollected,this.enemiesKilled, isTutorial));
            scene.scene.launch("pause-scene", { sceneKey });
        });

        const escapeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escapeKey.on('down', () => {
            click.play();
            if(!scene.scene.isPaused(sceneKey)){
                scene.scene.pause(sceneKey);
                PauseButton.sceneManager.remove('pause-scene');
                PauseButton.sceneManager.add('pause-scene', new PauseScene(this.scoreValue,this.stateValue,this.heartsValue,this.coinsCollected,this.enemiesKilled, isTutorial));
                scene.scene.launch("pause-scene", { sceneKey });
            }
        });

    }

    public updateScoreValue(newValue: number) {
        this.scoreValue = newValue;
    }
    public updateHeartsValue(newValue: number) {
        this.heartsValue = newValue;
    }
    public updateStateValue(newValue: State) {
        this.stateValue = newValue.name;
    }
    public updateCoinsCollected(newValue: number) {
        this.coinsCollected = newValue;
    }
    public updateEnemiesKilled(newValue: number) {
        this.enemiesKilled = newValue;
    }
}