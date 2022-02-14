export const harder_work = function(creep: Creep, roomName: string){
    if (creep.hits < creep.hitsMax)
        console.log(creep.name  + " pos:" + creep.pos.x + " " + creep.pos.y + " hits:" + creep.hits + " max:" + creep.hitsMax)
    if (creep.room.name == roomName){
        if (creep.hits < creep.hitsMax){
            creep.moveTo(new RoomPosition(4, 30, roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        }
        else{
            creep.moveTo(new RoomPosition(0, 31, roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        }
    }
    else{
        if (creep.hits < 1800)
        {
            creep.moveTo(new RoomPosition(49, 31, "W48S14"), {visualizePathStyle: {stroke: '#ff0000'}})
        }
        else{
            creep.moveTo(new RoomPosition(24, 36, "W48S14"), {visualizePathStyle: {stroke: '#ff0000'}})
        }
    }
}