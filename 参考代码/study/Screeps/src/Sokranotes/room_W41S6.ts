import { check_towers_id, tower_work } from "@/Universal/room_base/level3/tower";
import { check_one_role, clear_spawn_queue } from "@/Universal/room_base/universal_logic/check_spawn_queue";
import { source_energy_mine } from "@/Universal/room_base/universal_logic/source_energy_mine";
import { room_energy_mine } from "./room_base/room_energy_mine";

export const room_W41S6_running = function(roomName: string){

    let room = Game.rooms[roomName]
    if (room.memory.towers_id == undefined){
        if (Game.time % 100 == 0){
            check_towers_id(room)
        }
    }
    else{
        if (Game.flags.check_towers_id_flag && Game.flags.check_towers_id_flag.room.name == roomName){
            check_towers_id(room)
            Game.flags.check_towers_id_flag.remove()
        }
        tower_work(roomName)
    }

    if ((Game.time % 100 == 0 && Game.rooms[roomName].memory.spawnQueue.length == 0) || Memory.rooms[roomName].check_spawn_queue_flag){
        if (Memory.rooms[roomName].check_spawn_queue_flag)
            delete Memory.rooms[roomName].check_spawn_queue_flag
        let room = Game.rooms[roomName]
        clear_spawn_queue(roomName)

        check_one_role(room, 'upgrader_link')
        check_one_role(room, 'builder')
        check_one_role(room, 'repairer')
        check_one_role(room, 'carrier_W41S6')
        check_one_role(room, 'base_transfer')
    }

    let source_link: StructureLink = Game.getObjectById('619b24182020e245d4e39a7b')
    let dest_link: StructureLink = Game.getObjectById('619975ace0032f9ca8507ed1')
    if (source_link.store.getUsedCapacity(RESOURCE_ENERGY) > 0.8*source_link.store.getCapacity(RESOURCE_ENERGY))
        source_link.transferEnergy(dest_link)
    let ulink: StructureLink = Game.getObjectById("61b06bfa6d593b099f24763d")
    let source1_link: StructureLink = Game.getObjectById("61994a2fba77ee0dfa1d29bc")
    if (ulink.store.getUsedCapacity(RESOURCE_ENERGY) < 200){
        dest_link.transferEnergy(ulink)
        if (source1_link.store.getUsedCapacity(RESOURCE_ENERGY) > 0.8*source1_link.store.getCapacity(RESOURCE_ENERGY))
            source1_link.transferEnergy(ulink)
    }
    else{
        if (source1_link.store.getUsedCapacity(RESOURCE_ENERGY) > 0.6*source1_link.store.getCapacity(RESOURCE_ENERGY))
        source1_link.transferEnergy(dest_link)
    }

    if (Game.time % 100 == 2) source_energy_mine(roomName)
}