// Game.spawns['Spawn3'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], '简单硬', {memory: {role: 'simple_one_harder'}})

export const simple_one_harder_work = function(creep: Creep){
    // creep.moveTo(new RoomPosition(11, 16, 'W47S14'))
    // if (true){
    //     if (creep.pos.x == 11 && creep.pos.y == 16){
    //         creep.moveTo(new RoomPosition(11, 16, 'W47S14'))
    //     }
    //     else{
    //         let lab_lho2: StructureLab = Game.getObjectById('615b67b909f7903134462c0d')
    //         lab_lho2.boostCreep(creep)
    //         let lab_zho2: StructureLab = Game.getObjectById('615bb25d94d216562f056f23')
    //         lab_zho2.boostCreep(creep)
    //     }
    // }
    // else

    // if (creep.room.name != 'W41S7'){
    //     creep.heal(creep)
    //     let target
    //     if (creep.room.name == 'W47S14'){
    //         target = new RoomPosition(21, 1, 'W47S13')
    //     }
    //     else if (creep.room.name == 'W47S13'){
    //         target = new RoomPosition(23, 1, 'W47S12')
    //     }
    //     else if (creep.room.name == 'W47S12'){
    //         target = new RoomPosition(31, 1, 'W47S11')
    //     }
    //     else if (creep.room.name == 'W47S11'){
    //         target = new RoomPosition(48, 39, 'W47S10')
    //     }
    //     else if (creep.room.name == 'W47S10'){
    //         target = new RoomPosition(48, 31, 'W46S10')
    //     }
    //     else if (creep.room.name == 'W46S10'){
    //         target = new RoomPosition(48, 31, 'W45S10')
    //     }
    //     else if (creep.room.name == 'W45S10'){
    //         target = new RoomPosition(48, 31, 'W44S10')
    //     }
    //     else if (creep.room.name == 'W44S10'){
    //         target = new RoomPosition(48, 31, 'W43S10')
    //     }
    //     else if (creep.room.name == 'W43S10'){
    //         target = new RoomPosition(48, 31, 'W42S10')
    //     }
    //     else if (creep.room.name == 'W42S10'){
    //         target = new RoomPosition(48, 7, 'W41S10')
    //     }
    //     else if (creep.room.name == 'W41S10'){
    //         target = new RoomPosition(6, 1, 'W40S10')
    //     }
    //     else if (creep.room.name == 'W40S10'){
    //         target = new RoomPosition(7, 1, 'W40S9')
    //     }
    //     else if (creep.room.name == 'W40S9'){
    //         target = new RoomPosition(1, 29, 'W40S8')
    //     }
    //     else if (creep.room.name == 'W40S8'){
    //         target = new RoomPosition(21, 1, 'W41S8')
    //     }
    //     else if (creep.room.name == 'W41S8'){
    //         target = new RoomPosition(11, 26, 'W41S7')
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
    //         let tower: StructureTower = Game.getObjectById('613c0f1489c2b91d60d79c59')
    //         if (tower != undefined){
    //             if (creep.attack(tower) != OK){
    //                 creep.moveTo(tower)
    //             }
    //         }
    //         else{
    //             let spawn: StructureSpawn = Game.getObjectById('613a5db4e886cf3cabe6bce3')
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
    //                 else{
    //                 }
    //             }
    //         }
    //     }
    // }

    // if (creep.room.name != 'W41S6'){
    //     creep.moveTo(new RoomPosition(25, 25, 'W41S6'))
    // }
    // else{
    //     if (creep.hits < creep.hitsMax){
    //         creep.heal(creep)
    //     }
    //     else{
    //         let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    //         if (target){
    //             if (creep.attack(target) != OK){
    //                 creep.moveTo(target)
    //             }
    //         }
    //         else{
    //             let spawn: StructureSpawn = Game.getObjectById('6151a89e7cdaa18f445cc825')
    //             if (spawn != undefined){
    //                 if (creep.attack(spawn) != OK){
    //                     creep.moveTo(spawn)
    //                 }
    //             }
    //             else{
    //                 let rampart: StructureRampart = Game.getObjectById('6161687edc24290bf662ca63')
    //                 if (rampart != undefined){
    //                     if (creep.attack(rampart) != OK){
    //                         creep.moveTo(rampart)
    //                     }
    //                 }
    //                 else{
    //                     let tower: StructureTower = Game.getObjectById('6152b9a0683d7e64014af701')
    //                     if (tower != undefined){
    //                         if (creep.attack(tower) != OK){
    //                             creep.moveTo(tower)
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    if (creep.room.name != 'W47S14'){
        creep.moveTo(new RoomPosition(25, 25, 'W47S14'))
    }
    else{
        creep.moveTo(new RoomPosition(25, 25, 'W47S14'))
    }
}