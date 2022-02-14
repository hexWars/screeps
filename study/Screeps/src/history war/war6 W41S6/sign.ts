// Game.spawns['Spawn1'].spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, CLAIM], 'sssdds', {memory: {role: 'sign'}})

export const sign_work = function(creep: Creep){
    if (creep.room.name != 'W41S6'){
        if (creep.room.name == 'W48S12')
            creep.moveTo(new RoomPosition(25, 25, 'W48S11'))
        if (creep.room.name == 'W48S11')
            creep.moveTo(new RoomPosition(25, 25, 'W47S11'))
        if (creep.room.name == 'W47S11')
            creep.moveTo(new RoomPosition(25, 25, 'W47S10'))
        if (creep.room.name == 'W47S10')
            creep.moveTo(new RoomPosition(25, 25, 'W46S10'))
        if (creep.room.name == 'W46S10')
            creep.moveTo(new RoomPosition(25, 25, 'W45S10'))
        if (creep.room.name == 'W45S10')
            creep.moveTo(new RoomPosition(25, 25, 'W44S10'))
        if (creep.room.name == 'W44S10')
            creep.moveTo(new RoomPosition(25, 25, 'W43S10'))
        else
            creep.moveTo(new RoomPosition(25, 25, 'W41S6'))
    }
    else{
        if (creep.pos.x < 2 || creep.pos.y < 2 || creep.pos.x > 47 || creep.pos.y > 47)
            creep.moveTo(new RoomPosition(25, 25, 'W41S6'))
        let controller: StructureController = Game.getObjectById('5bbcaac79099fc012e6322e0')
        creep.moveTo(controller)
        if (creep.pos.isNearTo(controller))
            creep.claimController(controller)
        if (controller.my)
            creep.signController(controller, '6g3y is watching you.\n——村霸3号')
    }
}