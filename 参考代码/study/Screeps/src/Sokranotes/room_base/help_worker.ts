// Game.spawns['Spawn4'].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE, MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'help' + Game.time, {memory: {role: 'help', source_idx: 0}})

import { get_role_workers } from "@/Universal/room_base/universal_logic/check_spawn_queue"

export const help_work = function(creep: Creep){
    let dest_roomName: string = 'W44S12'
    if (creep.room.name != dest_roomName){
        creep.moveTo(new RoomPosition(25, 25, dest_roomName))
    }
    else{
        if ((creep.pos.x < 2 || creep.pos.y < 2 || creep.pos.x > 47 || creep.pos.y > 47) && creep.room.name == dest_roomName)
            creep.moveTo(new RoomPosition(25, 25, dest_roomName))
        else{
            // creep.memory.role = 'builder'
            creep.memory.help = true
            if (get_role_workers('hu', dest_roomName, 0).length > 0)
                creep.memory.role = 'hb'
            else{
                creep.memory.role = 'hu'
            }
        }
    }
}