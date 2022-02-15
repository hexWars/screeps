export const tower_transfer_work = function(creep: Creep){
    // creep.say('👋 base transfer');
    if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
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
        if (creep.store.getUsedCapacity() > 0){
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 0.3*structure.store.getCapacity(RESOURCE_ENERGY));
                }
            });
            if(target) {
                let code = creep.transfer(target, RESOURCE_ENERGY)
                if(code == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            else{
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(target) {
                    let code = creep.transfer(target, RESOURCE_ENERGY)
                    if(code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
                else{
                    let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_LAB) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                    if(target) {
                        let code = creep.transfer(target, RESOURCE_ENERGY)
                        if(code == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                        }
                    }
                }
            }
        }
    }
    else{
        let tmp_flag = true
        if (creep.room.memory.storage_id == undefined){
            let targets: StructureStorage[] = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            });
            if (targets.length > 0){
                creep.room.memory.storage_id = targets[0].id
            }
            else{
                tmp_flag = false
            }
        }
        if (tmp_flag){
            let storage = Game.getObjectById(creep.room.memory.storage_id)
            if (storage == null){
                let targets: StructureStorage[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE)
                    }
                });
                if (targets.length > 0){
                    creep.room.memory.storage_id = targets[0].id
                }
                else{
                    console.log(Game.time, 'tower_transfer_work', creep.room.name, 'storage is null')
                    creep.room.memory.storage_id = undefined
                }
            }
            if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    return
                }
            }
        }
        if (creep.room.memory.terminal_id == undefined){
            let targets: StructureTerminal[] = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL)
                }
            });
            if (targets.length > 0){
                creep.room.memory.terminal_id = targets[0].id
            }
        }
        let terminal = Game.getObjectById(creep.room.memory.terminal_id)
        if (terminal == null){
            let targets: StructureTerminal[] = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL)
                }
            });
            if (targets.length > 0){
                creep.room.memory.terminal_id = targets[0].id
            }
            else{
                console.log(Game.time, 'tower_transfer_work', creep.room.name, 'terminal is null')
                creep.room.memory.terminal_id = undefined
            }
        }
        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            if(creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffffff'}});
                return
            }
        }
    }
}