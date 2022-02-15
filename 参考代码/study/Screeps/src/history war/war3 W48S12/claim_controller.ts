export const claim_controller_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (creep.room.name != "W48S12"){
        creep.moveTo(new RoomPosition(8, 34, "W48S12"), {visualizePathStyle: {stroke: '#808080'}})
    }
    else{
        var controller: StructureController = Game.getObjectById('5bbcaa729099fc012e631602')
        var code = creep.claimController(controller)
        if (code == ERR_NOT_IN_RANGE){
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#00ff0e'}})
        }
        creep.signController(controller, 'HoPGoldy yyds!!!')
    }
}