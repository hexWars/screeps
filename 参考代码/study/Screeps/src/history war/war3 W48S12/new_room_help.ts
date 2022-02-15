export const new_room_help_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (creep.room.name != "W48S12"){
        creep.moveTo(new RoomPosition(8, 34, "W48S12"), {visualizePathStyle: {stroke: '#808080'}})
    }
    else{
        if (creep.pos.x >= 47){
            creep.moveTo(new RoomPosition(25, 25, "W48S12"), {visualizePathStyle: {stroke: '#808080'}})
        }
        else{
            // console.log(creep.memory.is_working)
            // console.log(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0)
            // console.log(!creep.memory.is_working && creep.store.getFreeCapacity() == 0)
            if (creep.memory.is_working == undefined){
                creep.memory.is_working = false
            }
            if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.is_working = false;
                creep.say('🔄 harvest'); 
            }
            if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
                creep.memory.is_working = true;
                creep.say('🚧 build');
            }
            if(creep.memory.is_working) {
                // if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {//距离够则升级控制器
                //     creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#4fcf30'}});
                // }
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) || 
                            (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0.2*structure.store.getCapacity(RESOURCE_ENERGY));
                    }
                });
                if(targets.length > 0) {
                    var code = creep.transfer(targets[0], RESOURCE_ENERGY)
                    if(code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
                else{
                    var construction = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                    if (construction){
                            if(creep.build(construction) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(construction, {visualizePathStyle: {stroke: '#008cff'}});
                            }
                    }
                    else{
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {//距离够则升级控制器
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#4fcf30'}});
                        }
                    }
                }
            }
            else {
                let sources: Source[] = creep.room.find(FIND_SOURCES)
                // console.log(sources.length)
                if (sources.length > 0){
                    if (creep.memory.source_idx == undefined || creep.memory.source_idx == 0){
                        let code = creep.harvest(sources[0])
                        // console.log('code', code)
                        if (code == ERR_NOT_IN_RANGE){
                            let code1 = creep.moveTo(sources[0])
                            if (code1 == ERR_NO_PATH){
                                creep.memory.source_idx = 1
                            }
                        }
                    }
                    else{
                        let code = creep.harvest(sources[1])
                        // console.log('code', code)
                        if (code == ERR_NOT_IN_RANGE){
                            let code1 = creep.moveTo(sources[1])
                            if (code1 == ERR_NO_PATH){
                                creep.memory.source_idx = 0
                            }
                        }
                        if (code == ERR_NOT_ENOUGH_RESOURCES){
                            let container: StructureContainer = Game.getObjectById("615a2a4846d6c263b42bfee6")
                            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                                creep.moveTo(container)
                            }
                        }
                    }
                }
                var res = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                creep.pickup(res)
            }
        }
    }
}