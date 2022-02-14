export const nuker_transfer_work = function(creep: Creep){
    // creep.say('👋 base transfer');
    if (creep.room.memory.nuker_id == undefined){
        let nukers: StructureNuker[] = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_NUKER)})
        if (nukers.length != 0)
            creep.room.memory.nuker_id = nukers[0].id
    }
    let nuker: StructureNuker = Game.getObjectById(creep.room.memory.nuker_id)
    if (nuker.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
        if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#808080'}});
            return
        }
        if(creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#808080'}});
            return
        }
        return
    }
    if (nuker.store.getFreeCapacity(RESOURCE_GHODIUM) > 0){
        if(creep.memory.is_working && creep.store[RESOURCE_GHODIUM] == 0) {
            // 如果在transfer状态，且没有能量了，那么退出transfer状态
            creep.memory.is_working = false;
            creep.say('🚧 withdraw');
        }
        if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
            //如果在withdraw状态，且取不了了，装满了，退出withdraw状态
            creep.memory.is_working = true;
            creep.say('🔄 transfer');
        }
        if (creep.memory.is_working){
            if(creep.transfer(nuker, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nuker, {visualizePathStyle: {stroke: '#808080'}});
                return
            }
        }
        else{
            if(creep.withdraw(creep.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#808080'}});
                return
            }
            if(creep.withdraw(creep.room.terminal, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#808080'}});
                return
            }
        }
    }
    else{
        if (creep.store[RESOURCE_GHODIUM] > 0){
            if(creep.transfer(creep.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#808080'}});
                return
            }
            if(creep.transfer(creep.room.terminal, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#808080'}});
                return
            }
        }
    }
}