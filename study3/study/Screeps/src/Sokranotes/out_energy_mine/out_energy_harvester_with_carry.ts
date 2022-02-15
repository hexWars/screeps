import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest"

export const out_energy_harvester_with_carry_work = function(creep: Creep){
    // creep.say('🔄 Here');
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    if (source_room == undefined){
        return
    }
    if (Game.rooms[creep.memory.source_roomName].memory.war_flag == true){
        creep.memory.is_working = false
        creep.moveTo(new RoomPosition(8, 34, creep.memory.dest_roomName), {visualizePathStyle: {stroke: '#808080'}})
    }
    else{
        if (creep.store.getCapacity() >= 50)
        {
            let transfer_creep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (cre) => {
                    return (cre.memory.role == 'out_passive_transfer' &&
                            cre.memory.source_idx == creep.memory.source_idx && 
                            cre.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            source_room.memory.room_harvester_energy_total += creep.store.getUsedCapacity()
            creep.transfer(transfer_creep, RESOURCE_ENERGY)
        }
        let source: Source = Game.getObjectById(source_room.memory.sources_id[creep.memory.source_idx])
        go_to_harvest(creep, source)
    }
}