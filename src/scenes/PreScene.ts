import Phaser from 'phaser';

export default class PreScene extends Phaser.Scene {

    constructor() {
        super('PreScene');
    }

    preload() {
        //this.load.image('bg', 'assets/level_2/bg-mountains.png');

        this.load.spritesheet('player', 'assets/level_1/move_sprite_1.png', {
            frameWidth: 32, frameHeight: 38, spacing: 32
        })
        this.load.spritesheet('clock', 'assets/level_1/hourglass.png', {
            frameWidth: 42, frameHeight: 42, spacing: 0
        })
        this.load.spritesheet('portal', 'assets/Portal.png', {
            frameWidth: 110, frameHeight: 111
        });
        this.load.spritesheet('portal0', 'assets/portal1.png', {
            frameWidth: 100, frameHeight: 111
        });
        this.load.spritesheet('portal2', 'assets/portal2.png', {
            frameWidth: 100, frameHeight: 111
        });

        this.load.spritesheet('mushroomRun', 'assets/enemies/Mushroom/Run.png', {
            frameWidth: 150, frameHeight: 150, spacing: 0
        })
        
        this.load.spritesheet('mushroomIdle', 'assets/enemies/Mushroom/Idle.png', {
            frameWidth: 150, frameHeight: 150, spacing: 0
        })

        this.load.spritesheet('eyeFlight', 'assets/enemies/Flying eye/Flight.png', {
            frameWidth: 150, frameHeight: 150, spacing: 0
        })

        this.load.spritesheet('birdRun','assets/enemies/Bird/birdRun.png', {
            frameWidth: 44, frameHeight: 41, spacing: 22
        })

        this.load.spritesheet('rockIdle','assets/enemies/Rock/rockIdle.png', {
            frameWidth: 24, frameHeight: 40, spacing: 0
        })
        this.load.spritesheet('boss', 'assets/enemies/Boss/Necromancer_creativekind-Sheet.png', {
            frameWidth: 160, frameHeight: 128, spacing: 0
        })

        this.load.image('enemy', 'assets/level_1/enemy.png');
        this.load.image('iceball', 'assets/iceball.png');
        this.load.image('fireball', 'assets/fireball.png');
        this.load.image('diamond', 'assets/diamond.png');
        this.load.image('speed', 'assets/speed.png');
        this.load.image('wider', 'assets/wider.png');
        this.load.image('extra', 'assets/extrahealth.png');
        this.load.image('mdpportal', 'assets/mdpportal.png');
        this.load.image('mdpportal2', 'assets/mdpportal2.png');
        this.load.image('mdpportal0', 'assets/mdpportal0.png');

        this.load.audio("coin_s","assets/sounds/coin.mp3")
        this.load.audio("powerup_s","assets/sounds/powerup.mp3")
        this.load.audio("kill_s","assets/sounds/kill.mp3")
        this.load.audio("shot_s","assets/sounds/shot.mp3")
        this.load.audio("death_s","assets/sounds/death.mp3")
        this.load.audio("hit_s","assets/sounds/hit.mp3")
        this.load.audio("click_s","assets/sounds/click.mp3")
        this.load.audio("levelup_s","assets/sounds/level_up.mp3")
        this.load.audio("jump_s","assets/sounds/jump.mp3")
        this.load.audio("door_s","assets/sounds/door.mp3")
        this.load.audio("start_s","assets/sounds/start.mp3")
        this.load.audio("win_s","assets/sounds/win.mp3")



        //please name other maps as this muster: 'level_x' and replace x with the corresponding lvel number 
        this.load.tilemapTiledJSON('level_0', 'assets/level_0/level_0.json');
        this.load.tilemapTiledJSON('level_1', 'assets/level_1/level_1.json');
        this.load.tilemapTiledJSON('level_2', 'assets/level_2/level_2.json');
        this.load.tilemapTiledJSON('level_3', 'assets/level_3/level_3.json');

        this.load.image('tiles-0', 'assets/level_0/main_lev_build_0.png');
        this.load.image('tiles-1', 'assets/level_1/main_lev_build_1.png');
        this.load.image('tiles-2', 'assets/level_2/main_lev_build_2.png');
        this.load.image('tiles-3', 'assets/level_3/main_lev_build_3.png');

        this.load.image("coin", "assets/coin.png");
        this.load.image("bg_1", "assets/level_1/cave.png");
    

        //once all images are loaded start level-01 scene  
        this.load.once('complete',() =>{
            this.scene.start('home-scene');
        })
    }
}

