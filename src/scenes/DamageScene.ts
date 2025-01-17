import Phaser from 'phaser';

export default class DamageScene extends Phaser.Scene {

    private levelSceneKey: string;
    private heart;
    private heartsGroup: Phaser.GameObjects.Group;
    // private scene: Phaser.Scene;

    constructor() {
        super('DamageScene');
    }

    init(data) {
        const { sceneKey, heartCount } = data;
        this.levelSceneKey = sceneKey
        this.heart = heartCount
    }

    create() {
        // Display a message to the player
        this.heartsGroup = this.add.group();       // Create hearts group
        const heartSpacing = 300; // Adjust this value based on the spacing between heart images
        const heartX = this.cameras.main.width/2 - 300; // Adjust the X position of the first heart image
        const heartY = this.cameras.main.height/2 - 200; // Adjust the Y position of the heart images
        this.heartsGroup.clear(true, true);

        for (let i = 0; i < this.heart+1; i++) {
            const heart = this.add.image(heartX + i * heartSpacing, heartY, "heartBig").setDepth(1);
            heart.setScrollFactor(0.01,0.01);
            this.heartsGroup.add(heart);
        }

        const heartsToRemove = 1;
        const hearts = this.heartsGroup.getChildren();
        
        for (let i = 0; i < heartsToRemove; i++) {
            const heartToRemove = hearts.pop();
    
            if (heartToRemove) {
                this.tweens.add({                 // Create the fade out effect
                    targets: heartToRemove,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 1000,
                    ease: "Power2",
                    onComplete: () => {
                        heartToRemove.destroy();
                    },
                });
            }
        }

        // Get the remaining hearts
        const remainingHearts = this.heartsGroup.getChildren();

        // Make the remaining hearts blink
        for (const heart of remainingHearts) {
            this.tweens.add({
                targets: heart,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                repeat: 2,
                yoyo: true,
                onComplete: () => {
                // After the blinking animation, stop the scene
                    this.scene.stop()
                }
            });
        }

    }
}