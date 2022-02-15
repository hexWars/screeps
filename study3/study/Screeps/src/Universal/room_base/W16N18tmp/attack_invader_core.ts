export const attack_invader_core_work = function(creep: Creep){
    // creep.say('🔄 attack');
    if (creep.room.name != 'W17N17'){
        creep.moveTo(new RoomPosition(45, 29, 'W17N17'))
        return
    }
    else{
        var invader: StructureInvaderCore = Game.getObjectById('618f49e483d943d631710fe4')
        if (invader != undefined){
            if (creep.attack(invader) != OK){
                creep.moveTo(invader)
            }
        }
    }
}