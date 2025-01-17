
import Phaser from 'phaser';
import Attacks from './Attacks';

export default class GroupAttacks extends Phaser.Physics.Arcade.Group {

    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 5,
            active: false,
            visible: false,
            key: 'iceball',
            classType: Attacks
        })
    }
}