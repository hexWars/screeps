export const range_work = function(creep: Creep){
    // creep.say('🔄 range');
    // if (creep.room.name != 'W48S16'){
    //     creep.moveTo(new RoomPosition(25, 25, 'W48S16'), {visualizePathStyle: {stroke: '#ff0000'}})
    // }
    // else{
    //     var tower: StructureTower = Game.getObjectById('6149ed5994d2166b95ff96f9')
    //     if (tower != undefined){
    //         if (creep.rangedAttack(tower) != OK){
    //             creep.moveTo(tower)
    //         }
    //     }
    //     else{
    //         var rampart: StructureRampart = Game.getObjectById('6151e94f1c6490b55187a26c')
    //         if (rampart != undefined){
    //             if (creep.rangedAttack(rampart) != OK){
    //                 creep.moveTo(rampart)
    //             }
    //         }
    //         else{
    //             var spawn: StructureSpawn = Game.getObjectById('6145fd8fe886cf49a9e73f64')
    //             if (spawn != undefined){
    //                 if (creep.rangedAttack(spawn) != OK){
    //                     creep.moveTo(spawn)
    //                 }
    //             }
    //             else{
    //                 var controller: StructureController = Game.getObjectById('5bbcaa729099fc012e631612')
    //                 if (controller != undefined){
    //                     if (creep.rangedAttack(controller) != OK){
    //                         creep.moveTo(controller)
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // 回撤代码
    // if (creep.room.name != 'W47S14'){
    //     creep.moveTo(new RoomPosition(25, 25, 'W47S14'), {visualizePathStyle: {stroke: '#ff0000'}})
    // }

    // 后续利用
    if (creep.room.name != 'W47S13'){
        creep.moveTo(new RoomPosition(16, 45, 'W47S13'), {visualizePathStyle: {stroke: '#ff0000'}})
    }
    else{
        var wall: StructureWall = Game.getObjectById('60e851d877736110f039c04e')
        if (wall != undefined){
            if (creep.rangedAttack(wall) != OK){
                creep.moveTo(wall)
            }
        }
        else{
            var wall: StructureWall = Game.getObjectById('60e851c81fac5810e0f05fa9')
            if (wall != undefined){
                if (creep.rangedAttack(wall) != OK){
                    creep.moveTo(wall)
                }
            }
        }
    }
}