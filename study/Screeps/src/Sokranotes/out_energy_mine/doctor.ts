export const doctor_work = function(creep: Creep, roomName: string){

    if (creep.room.name == roomName){
        creep.moveTo(new RoomPosition(5, 30, roomName))
        var harders = _.filter(Game.creeps, (creep) => creep.hits < creep.hitsMax);
        creep.heal(harders[0])
    }
}