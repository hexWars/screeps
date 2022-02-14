import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const energy_harvester_link_work = function(creep: Creep){
    // role: hl
    let link: StructureLink = Game.getObjectById(creep.room.memory.source_link_ids[creep.memory.source_idx])
    if (link == undefined){
        console.log(Game.time, "energy_harvester_link_work source link id:", creep.room.memory.source_link_ids[creep.memory.source_idx], 'index:', creep.memory.source_idx, 'undefined')
        return
    }
    creep.transfer(link, RESOURCE_ENERGY)
    if (creep.memory.source_roomName == undefined) creep.memory.source_roomName = creep.room.name
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    if (source_room == undefined){
        console.log(Game.time, "energy_harvester_link_work", creep.memory.source_roomName, 'undefined')
        return
    }
    let source: Source = Game.getObjectById(source_room.memory.sources_id[creep.memory.source_idx])
    if (link.store.getFreeCapacity(RESOURCE_ENERGY) != 0){
        if (creep.pos.isNearTo(source) && creep.pos.isNearTo(link)) go_to_harvest(creep, source)
        else{
            let x: number
            let y: number
            let terrain = new Room.Terrain(source.room.name)
            if ((source.pos.x - link.pos.x) % 2 == 0) x = (source.pos.x + link.pos.x) / 2
            if ((source.pos.y - link.pos.y) % 2 == 0) y = (source.pos.y + link.pos.y) / 2
            if (x == undefined)
                if (terrain.get(source.pos.x, y) == 1) x = link.pos.x
                else x = source.pos.x
            if (y == undefined)
                if (terrain.get(x, source.pos.y) == 1) y = link.pos.y
                else y = source.pos.y
            let pos: RoomPosition = new RoomPosition(x, y, creep.memory.source_roomName)
            creep.moveTo(pos)
        }
    }
}