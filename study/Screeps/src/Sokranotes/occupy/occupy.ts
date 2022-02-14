// Game.spawns['Spawn3'].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM], 'c', {memory: {role: 'occupy'}})

export const occupy_work = function(creep: Creep){
    // creep.say('🔄 Here');
    let controller: StructureController = Game.getObjectById('5bbcaaa49099fc012e631df8')
    if (creep.room.name == 'W44S12'){
        if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47) creep.moveTo(new RoomPosition(25, 25, "W44S12"))
        let code = creep.claimController(controller)
        if (code == ERR_NOT_IN_RANGE){
            creep.moveTo(controller)
        }
    }
    else{
        creep.moveTo(new RoomPosition(25, 25, "W44S12"))
    }
}