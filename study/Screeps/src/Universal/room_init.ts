export const room_init = function(roomName: string){
    let room = Game.rooms[roomName]
    if (Memory.rooms == undefined){
        Memory.rooms = {}
    }
    if (Memory.rooms[roomName] == undefined){
        Memory.rooms[roomName] = {}
    }
    if (room.memory.sources_id == undefined){
        let sources = room.find(FIND_SOURCES)
        room.memory.sources_id = new Array(sources.length)
        for (let i: number = 0; i < sources.length; i++){
            room.memory.sources_id[i] = sources[i].id;
        }
    }
}