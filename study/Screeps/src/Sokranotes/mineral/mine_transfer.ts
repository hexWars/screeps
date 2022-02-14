export const mine_transfer_work = function(creep: Creep){
    creep.memory.mine_type = RESOURCE_HYDROGEN
    // creep.say('👋 active transfer');
    var source_room: Room = Game.rooms[creep.memory.source_roomName]
    var dest_room: Room = Game.rooms[creep.memory.dest_roomName]
    // room空值检查
    // creep.memory.source_roomName = 'W47S14'
    // creep.memory.dest_roomName = 'W47S14'
    if (source_room == undefined){
        console.log(Game.time, " ", creep.memory.source_roomName, ' undefined')
        return
    }
    if (dest_room == undefined){
        console.log(Game.time, " ", creep.memory.dest_roomName, ' undefined')
        return
    }
    if(creep.memory.is_working && creep.store[creep.memory.mine_type] == 0) {
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
            var targets = source_room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL) &&
                        structure.store.getFreeCapacity(creep.memory.mine_type) > 0
                }
            });
            if(targets.length > 0) {
                let code = creep.transfer(targets[0], creep.memory.mine_type)
                if(code == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            else{
                var targets = source_room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store.getFreeCapacity(creep.memory.mine_type) > 0
                    }
                });
                if(targets.length > 0) {
                    let code = creep.transfer(targets[0], creep.memory.mine_type)
                    if(code == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
            }
        }
    }
    else{
        var container: StructureContainer = Game.getObjectById('61506d65d8dc480c9535823c')
        let code =  creep.withdraw(container, creep.memory.mine_type)
        if(code == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else if (code !=  OK){
            var res = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if (res != null){
                if (creep.pickup(res) == ERR_NOT_IN_RANGE){
                    creep.moveTo(res, {visualizePathStyle: {stroke: '#ffff00'}})
                }
            }
        }
    }
}