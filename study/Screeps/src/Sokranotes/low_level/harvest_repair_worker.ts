/* 
function:
harvest, transfer, repair

spawnCreep reqiure:bodys, name
creep.memory.role:'hr'
creep.memory.source_idx

run require:
Memory.rooms[creep.room.name].sources_id

other:
harvest_build_work
*/

import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"
import { go_to_repair } from "@/Universal/room_base/universal_logic/go_to_repair"

export const harvest_repair_work = function(creep: Creep){
    let priority: number = 15
    let minTicksToLive = 100

    if (creep.ticksToLive == minTicksToLive){
        const data = {
            name: creep.memory.role, 
            memory: {
                role: creep.memory.role,
                source_idx: creep.memory.source_idx
            }
        }
        creep.room.addSpawnTask(priority, data)
    }

    if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.is_working = false;
        creep.say('🔄 采');
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true;
        delete creep.memory.dontPullMe
        creep.say('🚧 修');
    }
    if(creep.memory.is_working) {
        go_to_repair(creep)
    }
    else{
        let source: Source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[creep.memory.source_idx])
        go_to_harvest(creep, source)
    }
}
