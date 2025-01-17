
export default anims=>{

    anims.create({
        key : 'mushroomRun',
        frames: anims.generateFrameNumbers('mushroomRun',{start:0,end:6}),
        frameRate: 7,
        repeat: 1
    })

    anims.create({
        key : 'mushroomIdle',
        frames: anims.generateFrameNumbers('mushroomIdle',{start:0,end:3}),
        frameRate: 7,
        repeat: 1
    })

    anims.create({
        key : 'eyeFlight',
        frames: anims.generateFrameNumbers('eyeFlight',{start:0,end:6}),
        frameRate: 7,
        repeat: -1
    })

    anims.create({
        key : 'birdRun',
        frames: anims.generateFrameNumbers('birdRun',{start:0,end:5}),
        frameRate: 7,
        repeat: -1
    })

    anims.create({
        key : 'rockIdle',
        frames: anims.generateFrameNumbers('rockIdle',{start:0,end:7}),
        frameRate: 7,
        repeat: 1
    })

    anims.create({
        key : 'bossIdle',
        frames: anims.generateFrameNumbers('boss',{start:0,end:7}),
        frameRate: 7,
        repeat: -1
    })
    anims.create({
        key : 'bossCast',
        frames: anims.generateFrameNumbers('boss',{start:34,end:46}),
        frameRate: 7,
        repeat: -1
    })
    
}
