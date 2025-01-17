//define all player's animation 
export default anims=>{

    anims.create({
        key : 'stand',
        frames: anims.generateFrameNumbers('player',{start:0,end:7}),
        frameRate: 8,
        repeat: -1
    })

    // anims.create({
    //     key : 'run',
    //     frames: anims.generateFrameNumbers('player',{start:11,end:16}),
    //     frameRate: 8,
    //     repeat: -1
    // })

    anims.create({
        key : 'jump',
        frames: anims.generateFrameNumbers('player',{start:17,end:23}),
        frameRate: 3     ,
        repeat: 1
    })

    anims.create({
        key : 'clock',
        frames: anims.generateFrameNumbers('clock',{start:0,end:14}),
        frameRate: 8     ,
        repeat: 1
    })
}
