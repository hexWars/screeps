// Game.spawns['Spawn4'].spawnCreep([MOVE,MOVE,CARRY,CARRY,CARRY,CARRY], 'mc' + Game.time, {memory: {role: 'move_compounds'}})

export const move_compounds_work = function(creep: Creep){
    // creep.say('👋 move_compounds');
    let target: StructureNuker = Game.getObjectById('617aaa764e2090a11364025d')
    let type: CommodityConstant | MineralConstant | RESOURCE_ENERGY | RESOURCE_GHODIUM = RESOURCE_GHODIUM
    
    if(creep.memory.is_working && creep.store[type] == 0) {
        // 如果在transfer状态，且没有能量了，那么退出transfer状态
        creep.memory.is_working = false;
        creep.say('🚧 withdraw');
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        //如果在withdraw状态，且取不了了，装满了，退出withdraw状态
        creep.memory.is_working = true;
        creep.say('🔄 transfer');
    }
    if (target.store.getFreeCapacity(type) > 0)
        if (creep.memory.is_working){
            if (creep.store.getUsedCapacity() > 0){
                if(target) {
                    let code = creep.transfer(target, type)
                    if(code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
            }
        }
        else{
            let terminal = creep.room.terminal
            if (terminal.store.getUsedCapacity(type) > 0){
                if(creep.withdraw(terminal, type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            if (creep.store.getFreeCapacity(type) != 0){
                let storage = creep.room.storage
                if (storage.store.getUsedCapacity(type) > 0){
                    if(creep.withdraw(storage, type) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
    else{
        if (creep.store.getUsedCapacity(type) != 0){
            let code = creep.transfer(creep.room.terminal, type)
            if(code == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        }
    }
}