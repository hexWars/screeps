// Game.spawns['Spawn1'].spawnCreep([MOVE,CLAIM], 'sssdds', {memory: {role: 'sign'}})

export const sign_work = function(creep: Creep){
    if (creep.room.name != 'W18N17'){// Kautzo overmind
        creep.moveTo(new RoomPosition(25, 25, 'W18N17'))
    }
    else{
        let controller: StructureController = Game.getObjectById('5bbcabe19099fc012e6346e0')
        if (controller != undefined){
            if (creep.claimController(controller) != ERR_NOT_IN_RANGE){
                creep.moveTo(controller)
            }
            else{
                creep.signController(controller, 'I want this room. ')
            }
        }
    }

    // if (creep.room.name != 'W19N15'){// ChaseShaw
    //     creep.moveTo(new RoomPosition(25, 25, 'W19N15'))
    // }
    // else{
    //     let controller: StructureController = Game.getObjectById('5bbcabd49099fc012e634563')
    //     if (controller != undefined){
    //         if (creep.signController(controller, 'I want this room. ') != OK){
    //             creep.moveTo(controller)
    //         }
    //     }
    // }
}