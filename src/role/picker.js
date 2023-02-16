
export const picker = function (creep) {

    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
        creep.say('🔄 pick');
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
        creep.memory.upgrading = true;
        creep.say('⚡ upgrade');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        // var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        // if(targets.length) {
        //     if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        //     }
        // }
    } else {
        console.log("进入")
        // 有能量的废墟
        var targets = Game.spawns['Spawn1'].room.find(FIND_RUINS, {
            filter: function (object) {
                return object.store[RESOURCE_ENERGY] > 0
            }
        })
        console.log("废墟数量:" + targets.length)
        console.log(targets[0].store[RESOURCE_ENERGY])
        // 存在的话取出能量
        if (targets.length > 0) {
            if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            creep.say("我没工作啦")
        }
    }

}
