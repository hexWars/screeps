/* 
function:
harvest, transfer, fill extension, spawn, tower

spawnCreep reqiure:bodys, name
creep.memory.role:'hf'
creep.memory.source_idx

run require:
Memory.rooms[creep.room.name].sources_id
 */

import { go_to_fill } from "@/Universal/room_base/universal_logic/go_to_fill"
import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const harvest_fill_work = function(creep: Creep){
    let priority: number = 0
    let minTicksToLive = 200
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
        creep.memory.is_working = false
        creep.say('🔄 采');
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true
        delete creep.memory.dontPullMe
        creep.say('🚧 填');
    }
    if(creep.memory.is_working) {
        if (creep.room.energyCapacityAvailable == creep.room.energyAvailable || creep.room.memory.war_flag){
            go_to_fill(creep, true)
        }
        else{
            go_to_fill(creep)
        }
    }
    else {
        let source: Source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[creep.memory.source_idx])
        go_to_harvest(creep, source)
    }
}