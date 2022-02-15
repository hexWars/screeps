import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const builder_work = function(creep: Creep){
    // creep.say('🔄 Here');

    if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.is_working = false
        creep.memory.path = null
        creep.say('🔄 harvest')
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true
        creep.memory.path = null
        creep.say('🚧 build')
    }
    if(creep.memory.is_working) {
        let constructions = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if(constructions.length > 0) {
            if(creep.build(constructions[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructions[0], {visualizePathStyle: {stroke: '#008cff'}});
            }
            return
        }
        else{
            creep.memory.role = 'repairer'
        }
    }
    else {
        if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 200){
            if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#808080'}});
            }
            return
        }
        if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 200){
            if(creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#808080'}});
            }
            return
        }
        if (creep.memory.source_idx == undefined)
        creep.memory.source_idx  = 0
        go_to_harvest(creep, Game.getObjectById(creep.room.memory.sources_id[creep.memory.source_idx]))
    }
}