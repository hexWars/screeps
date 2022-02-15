export const harvester_work = function(creep: Creep, roomName: string){
    // creep.say('👋 Here');
    if (creep.room.name == roomName){
        if(creep.store.getFreeCapacity() > 0) {
            // creep.say('🔄 harvest');
            // creep.memory.source_idx = 1 //近的这个，坐标13 29
            // creep.memory.source_idx = 0 //远的， 坐标5， 11
            var source: Source
            if (creep.room.memory.sources_id == undefined){
                var sources = creep.room.find(FIND_SOURCES)
                Memory.rooms[creep.room.name].sources_id = new Array(sources.length)
                for (var i: number = 0; i < sources.length; i++){
                    Memory.rooms[creep.room.name].sources_id[i] = sources[i].id;
                }
            }
            source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[creep.memory.source_idx])
            // if (!source){
            //     source = Game.getObjectById(Memory.rooms[roomName].source_ids[1-creep.memory.source_idx])
            // }
            // console.log(creep.harvest(source))
            var code:number
            code = creep.harvest(source)
            var flag: number = 1
            if (code == OK){
                flag = 0
            }
            else if (code == ERR_NOT_IN_RANGE) creep.moveTo(source, {visualizePathStyle: {stroke: '#808080'}});
            else if (code == ERR_NOT_ENOUGH_RESOURCES) {
                // console.log(creep.name + ' chang source to :' + (1 - creep.memory.source_idx))
                // creep.memory.source_idx = 1 - creep.memory.source_idx
                if (flag == 0){
                    console.log('挖光了,剩余时间：' + source.ticksToRegeneration)
                }
            }
            else if (code == ERR_INVALID_TARGET){
                var sources = creep.room.find(FIND_SOURCES)
                Memory.rooms[creep.room.name].sources_id = new Array(sources.length)
                for (var i: number = 0; i < sources.length; i++){
                    Memory.rooms[creep.room.name].sources_id[i] = sources[i].id;
                }
            }
            else if (code == ERR_NOT_OWNER  || code == ERR_NOT_FOUND || code == ERR_TIRED || code == ERR_NO_BODYPART){
                // code == ERR_BUSY: 忽略
                console.log("code: " + code + " havester line 45")
            }
        }
        else {
            creep.say('🚧transfer');
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            else{
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        // return (structure.structureType == STRUCTURE_STORAGE ||
                        //         structure.structureType == STRUCTURE_CONTAINER) &&
                        //         structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
                else{
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_TOWER &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                        }
                    });
                    if(targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                        }
                    }
                }
            }
        }
    }
    else{
        creep.moveTo(new RoomPosition(25, 25, roomName), {visualizePathStyle: {stroke: '#ffff00'}})
    }
}