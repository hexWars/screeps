export const carrier_help_work = function(creep: Creep){
    // creep.say('🔄 Here');
    // console.log(creep.store.getCapacity())
    if (creep.pos.x != 22 || creep.pos.y != 27)
    {
        creep.moveTo(new RoomPosition(22, 27, 'W47S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        var terminal: StructureTerminal = Game.getObjectById("614e5a7ab781a1b8bfc07334")
        var link: StructureLink = Game.getObjectById("6144f930e4eb6b750a8ca8c5")
        // var storage: StructureStorage = Game.getObjectById("613f6f4b1dd6ef15e8dfa724")
        // console.log(link.store.getUsedCapacity(RESOURCE_ENERGY))
        // console.log(terminal.store.getUsedCapacity(RESOURCE_ENERGY))
        if (link.store.getUsedCapacity(RESOURCE_ENERGY) < link.store.getCapacity(RESOURCE_ENERGY)){
            var code = creep.withdraw(terminal, RESOURCE_ENERGY)
            if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) <= 290000){
                code = creep.transfer(link, RESOURCE_ENERGY)
            }
        }
        // else{
        //     if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) <= 290000){
        //         var code = creep.withdraw(storage, RESOURCE_ENERGY)
        //         creep.transfer(terminal, RESOURCE_ENERGY)
        //     }
        //     // if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) >= 200000){
        //     //     var code = creep.withdraw(terminal, RESOURCE_ENERGY)
        //     //     var storage: StructureStorage = Game.getObjectById("613f6f4b1dd6ef15e8dfa724")
        //     //     creep.transfer(storage, RESOURCE_ENERGY)
        //     // }
        // }
        // console.log(terminal.store.getUsedCapacity(RESOURCE_ENERGY))
    }
}