// Game.spawns['Spawn3'].spawnCreep([MOVE,ATTACK], 'zzzzzzzzzzz', {memory: {role: 'simple_soldier'}})

export const simple_soldier_work = function(creep: Creep){
    // if (creep.room.name != 'W18N19'){//jskb
    //     let target
    //     if (creep.room.name == 'W16N18'){
    //         target = new RoomPosition(1, 26, 'W17N18')
    //     }
    //     else if (creep.room.name == 'W17N18'){
    //         target = new RoomPosition(19, 1, 'W18N18')
    //     }
    //     else if (creep.room.name == 'W18N18'){
    //         target = new RoomPosition(17, 47, 'W18N19')
    //     }
    //     if((!creep.memory.path || creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) && !creep.pos.isNearTo(target)) {
    //         // creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
    //         creep.memory.path = creep.pos.findPathTo(target);
    //     }
    //     let code = creep.moveByPath(creep.memory.path)
    //     if (code == ERR_NOT_FOUND){
    //         if (creep.pos.isNearTo(target)){
    //             creep.memory.path = null
    //         }
    //         else{
    //             // creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: true});
    //             creep.memory.path = creep.pos.findPathTo(target);
    //         }
    //     }
    // }
    // else{
    //     if (creep.pos.y >= 48){
    //         console.log('simple one harder arrive W41S7, rest tick:', creep.ticksToLive)
    //     }
    //     if (creep.hits < creep.hitsMax){
    //         creep.heal(creep)
    //     }
    //     else{
    //         let wall: StructureWall = Game.getObjectById('6161dc47018300cbf1113bf5')
    //         if (wall != undefined){
    //             if (creep.attack(wall) != OK){
    //                 creep.moveTo(wall)
    //             }
    //         }
    //         else{
    //             let tower: StructureTower = Game.getObjectById('6165d5815237852f1a5a7c4d')
    //             if (tower != undefined){
    //                 if (creep.attack(tower) != OK){
    //                     creep.moveTo(tower)
    //                 }
    //             }
    //             else{
    //                 let spawn: StructureSpawn = Game.getObjectById('615ffa3bd3d30427bc607914')
    //                 if (spawn != undefined){
    //                     if (creep.attack(spawn) != OK){
    //                         creep.moveTo(spawn)
    //                     }
    //                 }
    //                 else{
    //                     let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    //                     if (target){
    //                         if (creep.attack(target) != OK){
    //                             creep.moveTo(target)
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    // if (creep.room.name != 'W19N17'){//weewex
    //     creep.moveTo(new RoomPosition(25, 25, 'W19N17'))
    // }
    // else{
    //     let wall: StructureWall = Game.getObjectById('6161dc47018300cbf1113bf5')
    //     if (wall != undefined){
    //         if (creep.attack(wall) != OK){
    //             creep.moveTo(wall)
    //         }
    //     }
    //     else{
    //         let tower: StructureTower = Game.getObjectById('6167362ab35ec2844dd4f4ba')
    //         if (tower != undefined){
    //             if (creep.attack(tower) != OK){
    //                 creep.moveTo(tower)
    //             }
    //         }
    //         else{
    //             let spawn: StructureSpawn = Game.getObjectById('616225981dce2bb5f1a1ffd9')
    //             if (spawn != undefined){
    //                 if (creep.attack(spawn) != OK){
    //                     creep.moveTo(spawn)
    //                 }
    //             }
    //             else{
    //                 let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    //                 if (target){
    //                     if (creep.attack(target) != OK){
    //                         creep.moveTo(target)
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    if (creep.room.name != 'W19N16'){//Blank_Wing_Chicks
        creep.moveTo(new RoomPosition(25, 25, 'W19N16'))
    }
    else{
        let wall: StructureWall = Game.getObjectById('6161dc47018300cbf1113bf5')
        if (wall != undefined){
            if (creep.attack(wall) != OK){
                creep.moveTo(wall)
            }
        }
        else{
            let tower: StructureTower = Game.getObjectById('6166c66c52378530465ac2a7')
            if (tower != undefined){
                if (creep.attack(tower) != OK){
                    creep.moveTo(tower)
                }
            }
            else{
                let spawn: StructureSpawn = Game.getObjectById('61642c7ed3d3044fb260e1a9')
                if (spawn != undefined){
                    if (creep.attack(spawn) != OK){
                        creep.moveTo(spawn)
                    }
                }
                else{
                    let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                    if (target){
                        if (creep.attack(target) != OK){
                            creep.moveTo(target)
                        }
                    }
                }
            }
        }
    }
}