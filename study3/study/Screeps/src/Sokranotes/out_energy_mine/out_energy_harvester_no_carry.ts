import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const out_energy_harvester_no_carry_work = function(creep: Creep){
    // creep.say('👋 Here');
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    if (source_room.memory.war_flag == true){
        creep.memory.is_working = false
        creep.moveTo(new RoomPosition(8, 34, creep.memory.dest_roomName), {visualizePathStyle: {stroke: '#808080'}})
    }
    else{
        if (creep.memory.is_working == true){
            let source: Source = Game.getObjectById(source_room.memory.sources_id[creep.memory.source_idx])
            go_to_harvest(creep, source)
        }
        else{
            if (creep.pos.x == creep.memory.container_pos_x && creep.pos.y == creep.memory.container_pos_y){
                creep.memory.is_working = true
            }
            creep.moveTo(new RoomPosition(creep.memory.container_pos_x, creep.memory.container_pos_y, creep.memory.source_roomName), {visualizePathStyle: {stroke: '#808080'}})
        }
    }
}