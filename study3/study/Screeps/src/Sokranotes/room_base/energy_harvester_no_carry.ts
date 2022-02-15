import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const energy_harvester_no_carry_work = function(creep: Creep){
    // creep.say('👋 Here');
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    if (source_room == undefined){
        console.log(Game.time, "energy_harvester_no_carry_work", creep.memory.source_roomName, ' undefined')
        return
    }
    let source: Source = Game.getObjectById(source_room.memory.sources_id[creep.memory.source_idx])
    let pos = new RoomPosition(creep.memory.container_pos_x, creep.memory.container_pos_y, creep.memory.source_roomName)
    go_to_harvest(creep, source, pos)
}