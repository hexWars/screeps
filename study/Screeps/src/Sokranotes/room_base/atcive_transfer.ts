export const active_transfer_work = function(creep: Creep){
    // creep.say('👋 active transfer');
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    let dest_room: Room = Game.rooms[creep.memory.dest_roomName]
    // room空值检查
    if (source_room == undefined){
        console.log(Game.time, " ", creep.memory.source_roomName, 'undefined')
        return
    }
    if (dest_room == undefined){
        console.log(Game.time, " ", creep.memory.dest_roomName, 'undefined')
        return
    }
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
        let flag = true
        if (dest_room.memory.storage_id == undefined){
            let targets: StructureStorage[] = dest_room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            });
            if (targets.length > 0){
                dest_room.memory.storage_id = targets[0].id
            }
            else{
                flag = false
            }
        }
        if (flag){
            let storage = Game.getObjectById(dest_room.memory.storage_id)
            if (storage == null){
                let targets: StructureStorage[] = dest_room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE)
                    }
                });
                if (targets.length > 0){
                    dest_room.memory.storage_id = targets[0].id
                }
                else{
                    console.log(Game.time, 'active_transfer_work', dest_room.name, 'storage is null')
                    dest_room.memory.storage_id = undefined
                }
            }
            if (storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                let code = creep.transfer(storage, RESOURCE_ENERGY)
                if(code == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    return
                }
                else if (code == OK){
                    source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
                }
                else if (code != ERR_BUSY){
                    console.log(Game.time, 'active_transfer_work', code)
                }
            }
        }
        if (dest_room.memory.terminal_id == undefined){
            let targets: StructureTerminal[] = dest_room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL)
                }
            });
            if (targets.length > 0){
                dest_room.memory.terminal_id = targets[0].id
            }
        }
        let terminal = Game.getObjectById(dest_room.memory.terminal_id)
        if (terminal == null){
            let targets: StructureTerminal[] = dest_room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL)
                }
            });
            if (targets.length > 0){
                dest_room.memory.terminal_id = targets[0].id
            }
            else{
                console.log(Game.time, 'active_transfer_work', dest_room.name, 'terminal is null')
                dest_room.memory.terminal_id = undefined
            }
        }
        if (terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
            let code = creep.transfer(terminal, RESOURCE_ENERGY)
            if(code == ERR_NOT_IN_RANGE) {
                creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffffff'}});
                return
            }
            else if (code == OK){
                source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
            }
            else if (code != ERR_BUSY){
                console.log(Game.time, 'active_transfer_work', code, 'need new energy destination')
            }
        }
    }
    else{
        let container: StructureContainer = Game.getObjectById(source_room.memory.source_container_ids[creep.memory.source_container_idx])
        let code =  creep.withdraw(container, RESOURCE_ENERGY)
        if(code == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else if (code !=  OK){
            let res = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if (res != null){
                if (creep.pickup(res) == ERR_NOT_IN_RANGE){
                    creep.moveTo(res, {visualizePathStyle: {stroke: '#ffff00'}})
                }
            }
        }
    }
}