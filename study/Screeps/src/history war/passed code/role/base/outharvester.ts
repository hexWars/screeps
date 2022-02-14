export const outharvester_work = function(creep: Creep, roomName: string){
    creep.say('🔄 Here');
    if (Game.rooms["W48S14"].memory.war_flag){
        creep.memory.is_working = false
        creep.moveTo(new RoomPosition(5, 25, roomName), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        // creep.say('🔄 Here');
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
            creep.moveTo(new RoomPosition(0, 31, roomName), {visualizePathStyle: {stroke: '#00ff0e'}})
        }
        else{
            if (creep.memory.is_working == undefined)
            {
                creep.moveTo(new RoomPosition(34, 43, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
                if (creep.pos.x <= 36){
                    creep.memory.is_working = false
                }
            }
            // console.log(creep.store.getCapacity())
            if (creep.store.getCapacity() >= 50)
            {
                var transfer_creep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (cre) => {
                        return (cre.memory.role == 'transfer' &&
                                cre.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                    }
                });
                creep.transfer(transfer_creep, RESOURCE_ENERGY)
            }
            if(creep.memory.is_working == true) {
                creep.moveTo(new RoomPosition(34, 43, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
                if (creep.pos.x <= 36){
                    creep.memory.is_working = false
                }
                // creep.moveTo(new RoomPosition(49, 31, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
            }
            else {
                creep.memory.source_idx = 1
                console.log(creep.memory.source_idx)
                var source: Source = Game.getObjectById(Memory.rooms[creep.room.name].sources_id[creep.memory.source_idx])
                var code:number
                code = creep.harvest(source)
                console.log(creep.name, ' ', code)
                var flag: number = 1
                if (code == OK){
                    flag = 0
                }
                else if (code == ERR_NOT_IN_RANGE) creep.moveTo(source, {visualizePathStyle: {stroke: '#808080'}});
                else if (code == ERR_NOT_ENOUGH_RESOURCES) {
                    if (flag == 0){
                        console.log('挖光了,剩余时间：' + source.ticksToRegeneration)
                    }
                }
                else if (code == ERR_NOT_OWNER  || code == ERR_NOT_FOUND || code == ERR_TIRED || code == ERR_NO_BODYPART){
                    // code == ERR_BUSY: 忽略
                    console.log("code: " + code + " havester line 45")
                }
            }
        }
    }
}