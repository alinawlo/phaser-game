export default class Maps {
    /**
     * create specific map depedning on current Level
     * 
     */
    static createMap(scene: Phaser.Scene, x: number) {
        const map = scene.make.tilemap({key: `level_${x}`});
        map.addTilesetImage(`main_lev_build_${x}`, `tiles-${x}`);
        return map;
    }
    /**
     * create all layers from the map and return them
     * @returns 
     */
    static createLayers(map: Phaser.Tilemaps.Tilemap, x: number) {
        const tileset = map.getTileset(`main_lev_build_${x}`);
        const platformsColliders = map.createLayer('platforms_colliders', tileset);
        platformsColliders.setVisible(false);
        const platformsCollidersEnemeies = map.createLayer('platforms_colliders_enemies', tileset);
        platformsCollidersEnemeies.setVisible(false);
        const environment = map.createLayer('environment', tileset).setDepth(-2);
        const platforms = map.createLayer('platforms', tileset);
        const playerZones = map.getObjectLayer('player_zones');
        const collectables = map.getObjectLayer('collectables');
        const enemy_spawns = map.getObjectLayer('enemy_spawns');
        const enemyRandomSpawns = map.getObjectLayer('random_spawns');
        const FlyEnemyRandomSpawns = map.getObjectLayer('flying_random_spawns');
        const exit = map.createLayer('exit_collider', tileset);
        exit.setVisible(false);
        platformsColliders.setCollisionByExclusion([-1], true);
        platformsCollidersEnemeies.setCollisionByExclusion([-1], true);


    
        return {
            environment,
            platforms,
            platformsColliders,
            platformsCollidersEnemeies,
            playerZones,
            enemy_spawns,
            collectables,
            enemyRandomSpawns,
            FlyEnemyRandomSpawns,
            exit
        };
    }
    /**
     * get all diamonds objects from Objectlayer and put them in a group
     * @param objectslayer 
     * @returns 
     */
    static getCollectables(scene, objectslayer) {
        const collectable = scene.physics.add.staticGroup();
        objectslayer.objects.forEach(element => {
            collectable.get(element.x, element.y, 'diamond');
        });
        return collectable;
    }

    static showExit(map){
        const tileset = map.g
        map.createLayer('exit_collider', tileset);
    }
}