export const carrier1_W48S12_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (creep.memory.dontPullMe == undefined){
        creep.memory.dontPullMe = true;
    }
    if (creep.pos.x != 14 || creep.pos.y != 6)
    {
        creep.moveTo(new RoomPosition(14, 6, 'W48S12'), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        let link: StructureLink = Game.getObjectById("61695f491a993a36b0f39715")
        let storage: StructureStorage = Game.getObjectById("616443f5fd720f7fa73ac3eb")
        let dest_link: StructureLink = Game.getObjectById('61739e3ab6a4e1f3750c4432')
        // if (link.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
        //     if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
        //         creep.withdraw(link, RESOURCE_ENERGY)
        //     }
        //     else{
        //         creep.transfer(storage, RESOURCE_ENERGY)
        //     }
        // }
        if (link.store.getUsedCapacity(RESOURCE_ENERGY) < 600){
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                creep.withdraw(storage, RESOURCE_ENERGY)
            }
            else{
                creep.transfer(link, RESOURCE_ENERGY)
            }
        }
        else{
            link.transferEnergy(dest_link)
        }
    }
}