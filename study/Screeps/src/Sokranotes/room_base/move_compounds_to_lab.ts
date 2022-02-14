export const move_compounds_to_lab_work = function(creep: Creep){
    // creep.say('👋 move_compounds');
    // let move_to_lab_flag = true
    // let energy_flag = false
    let target: StructureLab
    let type: MineralBoostConstant| RESOURCE_ENERGY
    if (creep.memory.energy_flag == undefined || creep.memory.energy_flag){
        type = RESOURCE_ENERGY
        target = Game.getObjectById('615b67b909f7903134462c0d')
        if (target.store.getUsedCapacity(type) >= 2000){
            target = Game.getObjectById('615b2fe7b781a147a5c49b07')
            if (target.store.getUsedCapacity(type) >= 2000){
                target = Game.getObjectById('615bb25d94d216562f056f23')
                if (target.store.getUsedCapacity(type) >= 2000){
                    target = Game.getObjectById('615b90d0f305b6193d5bb36b')
                    if (target.store.getUsedCapacity(type) >= 2000){
                        creep.memory.energy_flag = false
                        type = RESOURCE_KEANIUM_ALKALIDE
                    }
                }
            }
        }
    }
    else{
        target = Game.getObjectById('615b67b909f7903134462c0d')
        type = RESOURCE_LEMERGIUM_ALKALIDE
        if (target.store.getUsedCapacity(type) >= 1000){
            target = Game.getObjectById('615b2fe7b781a147a5c49b07')
            type = RESOURCE_GHODIUM_ALKALIDE
            if (target.store.getUsedCapacity(type) >= 1000){
                target = Game.getObjectById('615bb25d94d216562f056f23')
                type = RESOURCE_ZYNTHIUM_ALKALIDE
                if (target.store.getUsedCapacity(type) >= 1000){
                    type = RESOURCE_KEANIUM_ALKALIDE
                    target = Game.getObjectById('615b90d0f305b6193d5bb36b')
                    if (target.store.getUsedCapacity(type) >= 1000){
                        creep.memory.energy_flag = true
                        type = RESOURCE_ENERGY
                    }
                }
            }
        }
    }
    
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
    if (creep.memory.move_to_lab_flag == undefined || creep.memory.move_to_lab_flag){
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
        }
    }
    else{
        if (creep.memory.is_working){
            let terminal = creep.room.terminal
            
            if (terminal.store.getUsedCapacity(type) > 0){
                if(creep.transfer(terminal, type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else{
            if (creep.store.getUsedCapacity() > 0){
                if(target) {
                    let code = creep.withdraw(target, type)
                    if(code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
            }
        }
    }
}