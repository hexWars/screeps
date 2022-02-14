export const attack_work = function(creep: Creep){
    // creep.say('🔄 attack');
    // if (creep.room.name != 'W48S12'){
    //     creep.say('🔄 attack');
    //     creep.moveTo(new RoomPosition(25, 25, 'W48S12'), {visualizePathStyle: {stroke: '#ff0000'}})
    // }
    // else{
    //     var spawn: StructureSpawn = Game.getObjectById('60b20278d1b5111d964b65bb')
    //     // console.log(spawn != null)
    //     if (spawn != null){
    //         if (creep.attack(spawn) != OK){
    //             creep.moveTo(spawn)
    //         }
    //     }
    //     else{
    //         var creeps: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS)
    //         // console.log(creep)
    //         if (creep){
    //             if (creep.attack(creeps[0]) != OK){
    //                 creep.moveTo(creeps[0], {visualizePathStyle: {stroke: '#ff0000'}})
    //             }
    //         }
    //     }
    // }

    // 回撤代码
    // if (creep.room.name != 'W47S14'){
    //     creep.moveTo(new RoomPosition(25, 25, 'W47S14'), {visualizePathStyle: {stroke: '#ff0000'}})
    // }

    // // 后续利用
    // if (creep.room.name != 'W47S13'){
    //     creep.moveTo(new RoomPosition(16, 45, 'W47S13'), {visualizePathStyle: {stroke: '#ff0000'}})
    // }
    // else{
    //     var wall: StructureWall = Game.getObjectById('60e89268b215532f77d42302')
    //     if (wall != undefined){
    //         if (creep.attack(wall) != OK){
    //             creep.moveTo(wall)
    //         }
    //     }
    //     else{
    //         var wall: StructureWall = Game.getObjectById('60e8926f60dbcaea636db9c2')
    //         if (wall != undefined){
    //             if (creep.attack(wall) != OK){
    //                 creep.moveTo(wall)
    //             }
    //         }
    //     }
    // }

    creep.say('🔄 attack');
    if (creep.room.name != 'W48S12'){
        creep.say('🔄 attack');
        creep.moveTo(new RoomPosition(25, 25, 'W48S12'), {visualizePathStyle: {stroke: '#ff0000'}})
    }
    else{
        var creeps: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS)
        // console.log(creep)
        if (creep){
            if (creep.attack(creeps[0]) != OK){
                creep.moveTo(creeps[0], {visualizePathStyle: {stroke: '#ff0000'}})
            }
        }
    }
}