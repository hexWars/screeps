import { room_config } from "@/Universal/room_base/config";
import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"
import { go_to_repair } from "@/Universal/room_base/universal_logic/go_to_repair";

export const repairer_work = function(creep: Creep){
    // creep.say('🔄 Here');    
    if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.is_working = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true;
        creep.say('🚧 repair');
    }
    if(creep.memory.is_working) {
        go_to_repair(creep)
        if ((creep.room.name == 'W47S14' || creep.room.name == 'W48S12') && creep.memory.role == 'hb'){
            creep.memory.role = 'builder'
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
