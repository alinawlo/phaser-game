import Phaser from "phaser";

export default class TransitonScene extends Phaser.Scene {
    constructor() {
        super("transition-scene");
    }
    create() {
        const sentences = [
            'Good job!',
            'Victory.',
            'Well done!',
            'Congratulations!',
            'Great work!',
            'Impressive!',
            'You did it!',
            'Amazing!',
            'Fantastic!',
            'Excellent!',
            'Bravo!',
            'Awesome!',
            'Outstanding!',
            'Superb!',
            'Terrific!',
            'Nice work!',
            'Keep it up!',
            'Incredible!',
            'Exceptional!',
            'Wonderful!',
            'Kudos!',
            'Thumbs up!',
            'Hooray!',
            'Way to go!',
            'Top-notch!',
            'Splendid!',
            'Magnificent!',
            'Good going!',
            'Brilliant!',
            'Job well done!',
            'You nailed it!',
            'Remarkable!',
            'A+!',
            'Super!',
            'Stellar!',
            'Excellent job!',
            'Well played!',
            'You\'re a star!',
            'Great effort!',
            'Phenomenal!',
            'First-rate!',
            'You rock!',
            'Nice job!',
            'You\'re unstoppable!',
            'Genius!',
            'Spectacular!',
            'Breathtaking!',
            'Thumbs up!',
            'Gold star!',
            'You\'re amazing!',
            'Fantastic work!',
            'Bravo! Bravo!',
        ];

        const levelup = this.sound.add("levelup_s").setVolume(0.1)
        levelup.play();

        const click = this.sound.add("click_s").setVolume(0.3)
          
        function getRandomSentence() {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            return sentences[randomIndex];
        }
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 200, getRandomSentence(), { fontSize: '128px', color: '#fff' })
            .setOrigin(0.5);

        const nextLevelButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'Next Level', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive();

        const homeButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'Home', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive();

        nextLevelButton.on('pointerdown', () => {
            click.play();
            this.events.emit('next');
            this.scene.stop('transition-scene');
        });

        homeButton.on('pointerdown', () => {
            click.play();
            this.events.emit('home');
            this.scene.stop('transition-scene');
        });
    }
}