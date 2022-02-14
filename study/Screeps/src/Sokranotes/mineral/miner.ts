export const miner_work = function(creep: Creep){
    if (Game.rooms[creep.memory.source_roomName]){
        var mine: Mineral = Game.getObjectById(Game.rooms[creep.memory.source_roomName].memory.mines_id[creep.memory.mine_idx])
    }
    else{
        console.log(Game.time, 'miner_work', 'source_roomName', creep.memory.source_roomName, 'undefined')
        return
    }
    if (creep.memory.is_working == true){
        creep.memory.mine_idx = 0
        if (Game.rooms[creep.memory.source_roomName].memory.mines_id == undefined){
            var mines = creep.room.find(FIND_MINERALS)
            Game.rooms[creep.memory.source_roomName].memory.mines_id = new Array(mines.length)
            for (var i: number = 0; i < mines.length; i++){
                Game.rooms[creep.memory.source_roomName].memory.mines_id[i] = mines[i].id
            }            
        }
        
        if (!mine){
            console.log('can not find the mine in ', creep.memory.source_roomName)
        }
        if(creep.harvest(mine) == ERR_NOT_IN_RANGE) {
            creep.moveTo(mine, {visualizePathStyle: {stroke: '#808080'}});
        }
    }
    else{
        if (creep.pos.x == 32 && creep.pos.y == 40){
            creep.memory.is_working = true
        }
        creep.moveTo(new RoomPosition(32, 40, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#808080'}})
    }
}