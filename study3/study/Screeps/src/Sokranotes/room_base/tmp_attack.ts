// Game.spawns['Spawn4'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], 'tmp_attack1', {memory: {role: 'tmp_attack'}});
// Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], 'tmp_attack2', {memory: {role: 'tmp_attack'}});
// Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], 'tmp_attack3', {memory: {role: 'tmp_attack'}});
export const tmp_attack_work = function(creep: Creep){
    // if (creep.body[6].boost == undefined){
    //     if (creep.memory.dontPullMe == undefined){
    //         creep.memory.dontPullMe = true;
    //     }
    //     if (creep.pos.x != 11 || creep.pos.y != 16){
    //         creep.moveTo(new RoomPosition(11, 16, 'W47S14'))
    //     }
    //     else{
    //         // let lab_lho2: StructureLab = Game.getObjectById('615b67b909f7903134462c0d')
    //         // lab_lho2.boostCreep(creep)
    //         let lab_zho2: StructureLab = Game.getObjectById('615bb25d94d216562f056f23')
    //         lab_zho2.boostCreep(creep)
    //         // let lab_gho2: StructureLab = Game.getObjectById('615b2fe7b781a147a5c49b07')
    //         // lab_gho2.boostCreep(creep)
    //     }
    // }
    // else if (creep.room.name != 'W46S15') creep.moveTo(new RoomPosition(25, 25, 'W46S15'))
    // else {
    //     if (creep.hitsMax > creep.hits) creep.heal(creep)
    //     if (creep.pos.x < 1) creep.moveTo(new RoomPosition(25, 25, 'W46S15'))
    // }
    // if (creep.body[6].boost != undefined && Game.flags.attack){
    //     if (creep.hitsMax - creep.hits >= 1200){
    //         creep.moveTo(new RoomPosition(1, 41, 'W46S15'))
    //     }
    //     else{
    //         let li = ['61c0dd7d28ba3ca9d621bae2', '61c0a3d4d448f4e872ad27e7']
    //         for (let i in li){
    //             let obj: Structure = Game.getObjectById(li[i])
    //             if (obj != undefined){
    //                 if (creep.attack(obj) != OK){
    //                     creep.moveTo(obj)
    //                 }
    //                 break
    //             }
    //             if (i == '61c0dd7d28ba3ca9d621bae2'){
    //                 let code = creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_PURIFIER)
    //                 if (code == ERR_NOT_IN_RANGE){
    //                     creep.moveTo(new RoomPosition(21, 30, 'W46S15'))
    //                 }
    //                 else {
    //                     if (creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_UTRIUM_BAR) != OK){
    //                         creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_PURIFIER)
    //                     }
    //                 }
    //                 if (creep.store.getFreeCapacity() == 0){
                        
    //                 }
    //             }
    //         }
    //     }
    // }

    // if (creep.room.name != 'W47S14') creep.moveTo(Game.rooms['W47S14'].terminal)
    // else{
    //     let code = creep.transfer(Game.rooms['W47S14'].terminal, RESOURCE_PURIFIER)
    //     if (code == ERR_NOT_IN_RANGE){
    //         creep.moveTo(new RoomPosition(21, 30, 'W46S15'))
    //     }
    //     else {
    //         if (creep.transfer(Game.rooms['W47S14'].terminal, RESOURCE_UTRIUM_BAR) != OK){
    //             creep.transfer(Game.rooms['W47S14'].terminal, RESOURCE_LIQUID)
    //         }
    //     }
    // }

    // if (creep.room.name != 'W41S7') creep.moveTo(new RoomPosition(25, 25, 'W41S7'))
    // else{
    //     if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47)
    //     creep.moveTo(new RoomPosition(25, 25, 'W41S7'))
    //     let obj: StructureSpawn = Game.getObjectById('61cbd70b3f190b3f79cf6b68')
    //     if (obj != undefined){
    //         if (creep.attack(obj) != OK){
    //             creep.moveTo(obj)
    //         }
    //     }
    //     else{
    //         let invade_targets = creep.room.find(FIND_HOSTILE_CREEPS, {
    //             filter: (creep) => (!global.white_list.has(creep.owner.username))
    //         });
    //         if (invade_targets.length > 0)
    //         {
    //             creep.room.memory.war_flag = true
    //             creep.room.memory.enemy_num = invade_targets.length
    //             if (creep.attack(invade_targets[0]) != OK)
    //             {
    //                 creep.moveTo(invade_targets[0])
    //             }
    //         }
    //     }
    // }

    if (creep.room.name != 'W44S12'){
        creep.moveTo(new RoomPosition(25, 25, "W44S12"))
    }
    else{
        if (creep.pos.x < 2 || creep.pos.x > 47 || creep.pos.y < 2 || creep.pos.y > 47)
            creep.moveTo(new RoomPosition(25, 25, "W44S12"))
        if (creep.claimController(creep.room.controller) != OK){
            creep.moveTo(creep.room.controller)
        }
    }
}