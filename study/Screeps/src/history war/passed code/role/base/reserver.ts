export const reserver_work = function(creep: Creep, roomName: string){
    creep.say('🔄 Here');
    if (Game.rooms["W48S14"].memory.war_flag){
        creep.moveTo(new RoomPosition(5, 25, roomName), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    // console.log("测试")
    // console.log(creep.pos.x != 22 || creep.pos.y != 27 || creep.room.name != "W48S14")
    // if (creep.room.name == roomName){
    //     creep.moveTo(new RoomPosition(0, 31, 'W47S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
    // }
    // else{
    //     creep.moveTo(new RoomPosition(45, 29, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
    // }
    if (creep.pos.x != 15 || creep.pos.y != 13 || creep.room.name != "W48S14")
    {
        creep.moveTo(new RoomPosition(15, 13, 'W48S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        var controller: StructureController = Game.getObjectById("5bbcaa729099fc012e631609")
        creep.reserveController(controller)
        // console.log('status:', creep.reserveController(controller))
        creep.signController(controller, '喵呜')
        if (controller != null && controller != undefined){
            if (controller.reservation != null && controller.reservation != undefined){
                creep.memory.reservation_tick = controller.reservation.ticksToEnd
            }
        }
    }
}