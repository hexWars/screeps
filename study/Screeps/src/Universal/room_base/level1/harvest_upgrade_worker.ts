/* 
function:
harvest, transfer, upgrade

spawnCreep reqiure:bodys, name
creep.memory.role:'hu'
creep.memory.source_idx

run require:
Memory.rooms[creep.room.name].sources_id
creep.room.controller
 */

import { go_to_harvest } from "../universal_logic/go_to_harvest";

export const harvest_upgrade_work = function(creep: Creep){
    let priority: number = 10
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
        creep.memory.is_working = false
        creep.say('🔄 采');
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true
        delete creep.memory.dontPullMe
        creep.say('🚧 升');
    }
    if(creep.memory.is_working) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#4fcf30'}});
        }
    }
    else {
        if (creep.memory.source_idx == undefined)
        creep.memory.source_idx  = 0
        let source: Source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[creep.memory.source_idx])
        if (creep.memory.help){
            if (source.energy == 0){
                if (Memory.rooms[creep.room.name].sources_id[1-creep.memory.source_idx] != undefined){
                    let tmp_source: Source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[1-creep.memory.source_idx])
                    if (tmp_source.energy != 0){
                        source = tmp_source
                        creep.memory.source_idx = 1-creep.memory.source_idx
                    }
                }
            }
        }
        go_to_harvest(creep, source)
    }
}