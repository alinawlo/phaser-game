import Phaser from "phaser";

export default class Coins extends Phaser.Physics.Arcade.Sprite {
    private xAxis: number;
    private yAxis: number;
    private cType;

    constructor(scene: Phaser.Scene, x: number, y: number, c: string) {
        if(c === 'c'){
            super(scene, x, y, 'coin');
        }else {
            super(scene, x, y, 'diamond');
        }
        this.cType=c;
        this.xAxis = x;
        this.yAxis = y;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        (c=='c') && this.setDisplaySize(50, 50);
        this.setCollideWorldBounds(true);
        this.setBounce(1);
    }

    disableCoin() {
        this.disableBody(true, true);
    }

    public get XAxis(): number {
        return this.xAxis;
    }

    public get YAxis(): number {
        return this.yAxis;
    }

    public get Type(): string {
        return this.cType;
    }
}