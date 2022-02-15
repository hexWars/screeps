export const reserver_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (Memory.rooms[creep.memory.source_roomName].war_flag == true){
        creep.memory.is_working = false
        creep.moveTo(new RoomPosition(8, 34, creep.memory.dest_roomName))
    }
    else{
        var controller: StructureController = Game.getObjectById(Memory.rooms[creep.memory.source_roomName].controller_id)
        var code = creep.reserveController(controller)
        if (code == ERR_NOT_IN_RANGE){
            creep.moveTo(controller)
        }
        else if (code == ERR_INVALID_TARGET){
            creep.attackController(controller)
        }
        creep.signController(controller, '6g3y is watching you.\n——村霸3号')
        if (controller != null && controller != undefined){
            if (controller.reservation != null && controller.reservation != undefined){
                creep.memory.reservation_tick = controller.reservation.ticksToEnd
            }
        }
    }
}