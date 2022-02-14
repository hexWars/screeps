export const attack_invader_core_work = function(creep: Creep){
    // creep.say('🔄 attack');
    if ((creep.room.name == 'W47S14' || (creep.room.name == 'W47S13' && creep.pos.x < 45)) && creep.memory.source_roomName == 'W46S13'){
        creep.moveTo(new RoomPosition(45, 29, 'W47S13'))
        return
    }
    if (creep.room.name != creep.memory.source_roomName){
        creep.moveTo(new RoomPosition(25, 25, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
    }
    else{
        var invade_targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => (!global.white_list.has(creep.owner.username)) && (creep.getActiveBodyparts(HEAL) > 1)
        });
        if (invade_targets.length > 0)
        {
            creep.room.memory.war_flag = true
            creep.room.memory.enemy_num = invade_targets.length
            if (creep.attack(invade_targets[0]) != OK)
            {
                creep.moveTo(invade_targets[0])
            }
        }
        else{
            var invade_targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => (!global.white_list.has(creep.owner.username))
            });
            if (invade_targets.length > 0)
            {
                creep.room.memory.war_flag = true
                creep.room.memory.enemy_num = invade_targets.length
                if (creep.attack(invade_targets[0]) != OK)
                {
                    creep.moveTo(invade_targets[0])
                }
            }
            else{
                var invader: StructureInvaderCore = Game.getObjectById(Memory.rooms[creep.memory.source_roomName].invader_core_id)
                if (invader != undefined){
                    if (creep.attack(invader) != OK){
                        creep.moveTo(invader)
                    }
                }
                else{
                    if (creep.pos.x > 45 || creep.pos.x < 5 || creep.pos.y > 45 || creep.pos.y < 5){
                        creep.moveTo(new RoomPosition(25, 25, creep.room.name))
                    }
                }
            }
        }
    }
}