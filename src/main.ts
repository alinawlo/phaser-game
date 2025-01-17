import Phaser from 'phaser'

import HomeScreen from './scenes/HomeScreen'
import LevelManager from './scenes/LevelManager'
import Level_00 from './scenes/levels/Level_00';
import Level_01 from './scenes/levels/Level_01';
import GameOverScene from './scenes/GameOver';
import PreScene from './scenes/PreScene';
import Level_02 from './scenes/levels/Level_02';
import PauseButton from './scenes/PauseButton';
import PauseScene from './scenes/PauseScene';
import TransitionScene from './scenes/TransitionScene';
import DamageScene from './scenes/DamageScene';
import Level_03 from './scenes/levels/Level_03';
import StoryScene from './scenes/StoryScene';
import EndScene from './scenes/Endscene';


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight, 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },

    scene: [PreScene, HomeScreen, LevelManager, StoryScene, Level_00, Level_01, Level_02, Level_03, GameOverScene, TransitionScene, DamageScene, EndScene]

}
const game = new Phaser.Game(config);

PauseButton.addScenes(game.scene);
HomeScreen.addScenes(game.scene);
PauseScene.addScenes(game.scene);
/* export default new Phaser.Game(config) */