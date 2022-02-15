// Game.spawns['Spawn3'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], '简单一体机', {memory: {role: 'simple_one_machine'}})

export const simple_one_machine_work = function(creep: Creep){
    if (creep.body[0].boost == undefined){
        if (creep.memory.dontPullMe == undefined){
            creep.memory.dontPullMe = true;
        }
        if (creep.pos.x != 11 || creep.pos.y != 16){
            creep.moveTo(new RoomPosition(11, 16, 'W47S14'))
        }
        else{
            let lab_lho2: StructureLab = Game.getObjectById('615b67b909f7903134462c0d')
            lab_lho2.boostCreep(creep)
            let lab_zho2: StructureLab = Game.getObjectById('615bb25d94d216562f056f23')
            lab_zho2.boostCreep(creep)
            let lab_gho2: StructureLab = Game.getObjectById('615b2fe7b781a147a5c49b07')
            lab_gho2.boostCreep(creep)
            let lab_kho2: StructureLab = Game.getObjectById('615b90d0f305b6193d5bb36b')
            lab_kho2.boostCreep(creep)
        }
    }
    else if (creep.room.name != 'W41S7'){//CheYiBaJJ
        if (creep.room.name == 'W47S14'){
            creep.moveTo(new RoomPosition(21, 1, 'W47S13'))
        }
        else if (creep.room.name == 'W47S13'){
            creep.moveTo(new RoomPosition(23, 1, 'W47S12'))
        }
        else if (creep.room.name == 'W47S12'){
            creep.moveTo(new RoomPosition(31, 1, 'W47S11'))
        }
        else if (creep.room.name == 'W47S11'){
            creep.moveTo(new RoomPosition(48, 39, 'W47S10'))
        }
        else if (creep.room.name == 'W47S10'){
            creep.moveTo(new RoomPosition(48, 31, 'W46S10'))
        }
        else if (creep.room.name == 'W46S10'){
            creep.moveTo(new RoomPosition(48, 31, 'W45S10'))
        }
        else if (creep.room.name == 'W45S10'){
            creep.moveTo(new RoomPosition(48, 31, 'W44S10'))
        }
        else if (creep.room.name == 'W44S10'){
            creep.moveTo(new RoomPosition(48, 31, 'W43S10'))
        }
        else{
            creep.moveTo(new RoomPosition(25, 25, 'W41S7'))
        }
    }
    else{
        // console.log('simple one machine arrive W41S6, rest tick:', creep.ticksToLive)
        let target: StructureTower = Game.getObjectById('61846a3246d6c2633f38fd58')
        if (target != undefined){
            ranged_attack_target(creep, target)
        }
        else{
            let target: StructureSpawn = Game.getObjectById('6184d43f6baf7487f132aee6')
            if (target != undefined){
                ranged_attack_target(creep, target)
            }
            else{
                let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                if (target){
                    ranged_attack_target(creep, target)
                }
            }
        }
    }
    creep.rangedMassAttack()
    creep.heal(creep)
}

const ranged_attack_target = function(creep: Creep, target){
    if (creep.pos.inRangeTo(target, 3)){
        if (creep.pos.isNearTo(target)){
            creep.rangedMassAttack()
        }
        else{
            creep.rangedAttack(target)
            creep.moveTo(target)
        }
    }
    else{
        creep.moveTo(target)
        return true
    }
}