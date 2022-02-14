
// Game.spawns['Spawn2'].spawnCreep([MOVE, CLAIM], 'claim_controller', {memory: {role: 'claim_controller'}})

export const claim_controller_work = function(creep: Creep){
    if (creep.room.name != 'W41S6'){
        let target
        if (creep.room.name == 'W48S12'){
            target = new RoomPosition(48, 41, 'W48S11')
        }
        else if (creep.room.name == 'W48S11'){
            target = new RoomPosition(32, 1, 'W47S11')
        }
        else if (creep.room.name == 'W47S11'){
            target = new RoomPosition(48, 39, 'W47S10')
        }
        else if (creep.room.name == 'W47S10'){
            target = new RoomPosition(48, 31, 'W46S10')
        }
        else if (creep.room.name == 'W46S10'){
            target = new RoomPosition(48, 31, 'W45S10')
        }
        else if (creep.room.name == 'W45S10'){
            target = new RoomPosition(48, 31, 'W44S10')
        }
        else if (creep.room.name == 'W44S10'){
            target = new RoomPosition(48, 31, 'W43S10')
        }
        else if (creep.room.name == 'W43S10'){
            target = new RoomPosition(48, 31, 'W42S10')
        }
        else if (creep.room.name == 'W42S10'){
            target = new RoomPosition(48, 7, 'W41S10')
        }
        else if (creep.room.name == 'W41S10'){
            target = new RoomPosition(6, 1, 'W40S10')
        }
        else if (creep.room.name == 'W40S10'){
            target = new RoomPosition(7, 1, 'W40S9')
        }
        else if (creep.room.name == 'W40S9'){
            target = new RoomPosition(1, 29, 'W40S8')
        }
        else if (creep.room.name == 'W40S8'){
            target = new RoomPosition(21, 1, 'W41S8')
        }
        else if (creep.room.name == 'W41S8'){
            target = new RoomPosition(17, 1, 'W41S7')
        }
        else if (creep.room.name == 'W41S7'){
            target = new RoomPosition(29, 28, 'W41S6')
        }
        if((!creep.memory.path || creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) && !creep.pos.isNearTo(target)) {
            // creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
            creep.memory.path = creep.pos.findPathTo(target);
        }
        let code = creep.moveByPath(creep.memory.path)
        if (code == ERR_NOT_FOUND){
            if (creep.pos.isNearTo(target)){
                creep.memory.path = null
            }
            else{
                // creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
                creep.memory.path = creep.pos.findPathTo(target);
            }
        }
    }
    else{
        console.log('arrive W41S6, rest tick:', creep.ticksToLive)
        if (creep.claimController(creep.room.controller) != OK){
            creep.moveTo(creep.room.controller)
        }
    }
}