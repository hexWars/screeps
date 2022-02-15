export const transfer1_work = function(creep: Creep, roomName: string){
    if (Game.rooms["W48S14"].memory.war_flag){
        creep.memory.is_working = false
        creep.moveTo(new RoomPosition(5, 25, roomName), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
            // 如果在工作状态，且没有能量了，那么退出工作状态
            creep.memory.is_working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
            //如果在采集状态，且采集不了了，装满了，退出采集状态
            creep.memory.is_working = true;
            creep.say('🚧 transfer');
        }
        if (creep.room.name == roomName){
            if (creep.memory.is_working){
                var linkFrom: StructureLink = Game.getObjectById("61450b41047f4458ae00790f")
                if(creep.transfer(linkFrom, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(linkFrom, {visualizePathStyle: {stroke: '#ffff00'}});
                }
                var linkTo: StructureLink = Game.getObjectById("6144f930e4eb6b750a8ca8c5")
                linkFrom.transferEnergy(linkTo);
                // var targets = creep.room.find(FIND_STRUCTURES, {
                //     filter: (structure) => {
                //         return (structure.structureType == STRUCTURE_TOWER &&
                //                 structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                //     }
                // });
                // if(targets.length > 0) {
                //     if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                //     }
                // }
                // else{
                //     var targets = creep.room.find(FIND_STRUCTURES, {
                //         filter: (structure) => {
                //             return (structure.structureType == STRUCTURE_EXTENSION ||
                //                     structure.structureType == STRUCTURE_SPAWN) &&
                //                     structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                //         }
                //     });
                //     if(targets.length > 0) {
                //         if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //             creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                //         }
                //     }
                //     else{
                //         targets = creep.room.find(FIND_STRUCTURES, {
                //             filter: (structure) => {
                //                 return (structure.structureType == STRUCTURE_STORAGE) &&
                //                     structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                //                 // return (structure.structureType == STRUCTURE_STORAGE ||
                //                 //     structure.structureType == STRUCTURE_CONTAINER) &&
                //                 // structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                //             }
                        
                //         });
                //         if(targets.length > 0) {
                //             if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //                 creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                //             }
                //         }
                //     }
                // }
            }
            else{
                creep.moveTo(new RoomPosition(0, 31, roomName), {visualizePathStyle: {stroke: '#00ff0e'}})
            }
        }
        else{
            // console.log(creep.name, creep.memory.is_working)
            if (creep.memory.is_working == undefined){
                creep.moveTo(new RoomPosition(10, 32, 'W48S14'), {visualizePathStyle: {stroke: '#ffff00'}})
            }
            // console.log(creep.name, creep.memory.is_working)
            if(creep.memory.is_working) {
                creep.moveTo(new RoomPosition(49, 33, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
            }
            else {
                var farm_creeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: (cre) => {
                        return (cre.memory.role == 'outharvester1' &&
                                cre.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                    }
                });
                if (farm_creeps.length > 0){
                    if (farm_creeps[0].pos.x < 13)
                        creep.moveTo(farm_creeps[0], {visualizePathStyle: {stroke: '#008cff'}});
                }
                else{
                    creep.moveTo(new RoomPosition(11, 32, 'W48S14'), {visualizePathStyle: {stroke: '#ffff00'}})
                }
            }
        }
    }
}