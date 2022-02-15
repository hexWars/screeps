import FlatQueue from './FlatQueue'

let initSpawnQueue = {
    /**
     * Process all the rules for a room and create a spawn queue
     *
     * @param room {Room}
     */
    run: function(room)
    {
        if (Memory.rooms[room.name].spawnQueue == undefined){
            Memory.rooms[room.name].spawnQueue = {};
        }
        this.spawnQueue = new FlatQueue(Memory.rooms[room.name].spawnQueue);
    }
}

export default initSpawnQueue