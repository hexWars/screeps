export const out_active_transfer_work = function(creep: Creep){
    let code:number
    // creep.say('👋 active transfer');
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    let dest_room: Room = Game.rooms[creep.memory.dest_roomName]
    // room空值检查
    if (source_room == undefined){
        console.log(Game.time, " ", creep.memory.source_roomName, ' undefined')
        return
    }
    if (dest_room == undefined){
        console.log(Game.time, " ", creep.memory.dest_roomName, ' undefined')
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
    // console.log(creep.memory.is_working)
    if (creep.memory.is_working){
        if (creep.store.getUsedCapacity() > 0){
            let link: StructureLink = Game.getObjectById('61450b41047f4458ae00790f')
            code = creep.transfer(link, RESOURCE_ENERGY)
            if(code == ERR_NOT_IN_RANGE) {
                creep.moveTo(link, {visualizePathStyle: {stroke: '#ffff00'}});
            }
            else if(code == OK){
                source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
            }
            // let targets = dest_room.find(FIND_STRUCTURES, {
            //     filter: (structure) => {
            //         return (structure.structureType == STRUCTURE_EXTENSION ||
            //                 structure.structureType == STRUCTURE_SPAWN) &&
            //                 structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            //     }
            // });
            // if(targets.length > 0) {
            //     code = creep.transfer(targets[0], RESOURCE_ENERGY)
            //     if(code == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
            //     }
            //     else if(code == OK){
            //         source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
            //     }
            // }
            // else{
            //     let targets = source_room.find(FIND_STRUCTURES, {
            //         filter: (structure) => {
            //             return (structure.structureType == STRUCTURE_TOWER &&
            //                     structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0.2*structure.store.getCapacity(RESOURCE_ENERGY));
            //         }
            //     });
            //     if(targets.length > 0) {
            //         code = creep.transfer(targets[0], RESOURCE_ENERGY)
            //         if(code == ERR_NOT_IN_RANGE) {
            //             creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
            //         }
            //         else if(code == OK){
            //             source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
            //         }
            //     }
            //     else{
            //         targets = source_room.find(FIND_STRUCTURES, {
            //             filter: (structure) => {
            //                 return (structure.structureType == STRUCTURE_STORAGE) &&
            //                     structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            //             }
            //         });
            //         if(targets.length > 0) {
            //             code = creep.transfer(targets[0], RESOURCE_ENERGY)
            //             if(code == ERR_NOT_IN_RANGE) {
            //                 creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
            //             }
            //             else if(code == OK){
            //                 source_room.memory.source_gets[creep.memory.source_idx] += creep.store.getCapacity(RESOURCE_ENERGY)
            //             }
            //         }
            //     }
            // }
        }
    }
    else{
        let container: StructureContainer = Game.getObjectById(source_room.memory.source_container_ids[creep.memory.source_container_idx])
        code =  creep.withdraw(container, RESOURCE_ENERGY)
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