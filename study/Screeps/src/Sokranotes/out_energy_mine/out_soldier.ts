export const out_soldier_work = function(creep: Creep){
    if (creep.hits < 2/3*creep.hitsMax){
        if (creep.room.name != creep.memory.dest_roomName){
            creep.moveTo(new RoomPosition(25, 25, creep.memory.dest_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        }
        else{
            var doctors: Creep[] = creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.getActiveBodyparts(HEAL) > 1);
                }
            });
            if (doctors.length > 0)
            {
                creep.moveTo(doctors[0])
            }
        }
    }
    else{
        if (creep.room.name != creep.memory.source_roomName){
            creep.moveTo(new RoomPosition(25, 25, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        }
        else{
            if (creep.pos.x > 47 || creep.pos.x < 2 || creep.pos.y < 2 || creep.pos.y > 47){
                creep.moveTo(new RoomPosition(25, 25, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
            }
            let invade_targets = Game.rooms[creep.room.name].find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => (!global.white_list.has(creep.owner.username)) && (creep.getActiveBodyparts(HEAL) > 1)
            });
            if (invade_targets.length > 0)
            {
                creep.room.memory.war_flag = true
                creep.room.memory.enemy_num = invade_targets.length
                if (creep.rangedAttack(invade_targets[0]) != OK)
                {
                    creep.moveTo(invade_targets[0])
                }
            }
            else{
                invade_targets = creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (creep) => (!global.white_list.has(creep.owner.username))
                });
                if (invade_targets.length > 0)
                {
                    creep.room.memory.war_flag = true
                    creep.room.memory.enemy_num = invade_targets.length
                    if (creep.rangedAttack(invade_targets[0]) != OK)
                    {
                        creep.moveTo(invade_targets[0])
                    }
                }
                else{
                    creep.room.memory.war_flag = false
                    creep.room.memory.enemy_num = 0
                    if (creep.memory.dest_roomName == 'W47S15'){
                        creep.moveTo(new RoomPosition(26, 21, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
                    }
                    else{
                        creep.moveTo(new RoomPosition(25, 22, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#ff0000'}})
                    }
                }
            }
        }
    }
}