// Game.spawns['Spawn1'].spawnCreep([MOVE,ATTACK], 'zzzzzzzzzzz', {memory: {role: 'simple_soldier'}})

export const simple_soldier_work = function(creep: Creep){
    // if (creep.room.name != 'W18N17'){// Kautzo overmind
    //     creep.moveTo(new RoomPosition(25, 25, 'W18N17'))
    // }
    // else{
    //     let spawn: StructureSpawn = Game.getObjectById('615fe215c1953d5020c897f8')
    //     if (spawn != undefined){
    //         if (creep.attack(spawn) != OK){
    //             creep.moveTo(spawn)
    //         }
    //     }
    //     else{
    //         let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
    //             filter: (creep) => {
    //                 return (creep.pos.x < 48 && creep.pos.x > 2 && creep.pos.y > 2 && creep.pos.y < 48)
    //             }
    //         })
    //         if (target){
    //             if (creep.attack(target) != OK){
    //                 creep.moveTo(target)
    //             }
    //         }
    //         else{
    //             let target = creep.room.find(FIND_CONSTRUCTION_SITES, {
    //                 filter: (structure) => {
    //                     return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
    //                 }
    //             })
    //             if (target.length > 0){
    //                 creep.moveTo(target[0])
    //             }
    //         }
    //     }
    // }

    if (creep.room.name != 'W18N16'){// ChaseShaw
        creep.moveTo(new RoomPosition(25, 25, 'W18N16'))
    }
    else{
        let spawn: StructureSpawn = Game.getObjectById('612b059f8b0a096b45ba27c2')
        if (spawn != undefined){
            if (creep.attack(spawn) != OK){
                creep.moveTo(spawn)
            }
        }
        else{
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: (creep) => {
                    return (creep.pos.x < 48 && creep.pos.x > 2 && creep.pos.y > 2 && creep.pos.y < 48)
                }
            })
            if (target){
                if (creep.attack(target) != OK){
                    creep.moveTo(target)
                }
            }
            else{
                let target = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
                    }
                })
                if (target.length > 0){
                    creep.moveTo(target[0])
                }
            }
        }
    }
}