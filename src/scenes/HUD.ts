import Phaser from "phaser";
import State from "../State";

export default class HUD {
    private scene: Phaser.Scene;
    private scoreText: Phaser.GameObjects.Text;
    private score = 0;
    private heart = 3;
    private state;
    private heartsGroup: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, startState) {
        this.state = startState.name;
        this.scene = scene;
        this.heartsGroup = scene.add.group();       // Create hearts group
        this.createHearts(scene);
        this.scoreText = scene.add.text(10, 20, "Score: 0" + " State: " + this.state, {
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
        }).setDepth(1);
        this.scoreText.scrollFactorX = 0.01;
        this.scoreText.scrollFactorY = 0.01;
    }

    createHearts(scene: Phaser.Scene) {
        const heartSpacing = 40; // Adjust this value based on the spacing between heart images
        const heartX = 30; // Adjust the X position of the first heart image
        const heartY = 70; // Adjust the Y position of the heart images
        this.heartsGroup.clear(true, true);

        for (let i = 0; i < this.heart; i++) {
            const heart = scene.add.image(heartX + i * heartSpacing, heartY, "heart").setDepth(1);
            heart.setScrollFactor(0.01,0.01);
            this.heartsGroup.add(heart);
        }
    }

    updateScore(score: number, ){
        this.score=score;
        this.scoreText.setText("Score: " + this.score + " State: " + this.state);
    }
    updateHeart(heart: number) {
        if (heart < this.heart) {
            const heartsToRemove = this.heart - heart;
            const hearts = this.heartsGroup.getChildren();
        
            for (let i = 0; i < heartsToRemove; i++) {
                const heartToRemove = hearts.pop();
        
                if (heartToRemove) {
                    this.scene.tweens.add({                 // Create the fade out effect
                        targets: heartToRemove,
                        alpha: 0,
                        scaleX: 0,
                        scaleY: 0,
                        duration: 1000,
                        ease: "Power1",
                        onComplete: () => {
                            heartToRemove.destroy();
                        },
                    });
                }
            }
        }
        this.heart = heart;
        this.heartsGroup.clear(true, true);
        this.createHearts(this.heartsGroup.scene); // Update the hearts group
    }
    updateState(state: State){
        this.state=state.name;
        this.scoreText.setText("Score: " + this.score + " State: " + this.state);
    }

    public get Score(): number {
        return this.score;
    }
}