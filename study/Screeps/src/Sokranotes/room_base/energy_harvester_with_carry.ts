import { go_to_harvest } from "@/Universal/room_base/universal_logic/go_to_harvest";

export const energy_harvester_with_carry_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (creep.store.getCapacity() >= 50)
    {
        let transfer_creep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (cre) => {
                return (cre.memory.role == 'passive_transfer' &&
                        cre.memory.source_idx == creep.memory.source_idx && 
                        cre.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
            }
        });
        creep.transfer(transfer_creep, RESOURCE_ENERGY)
    }
    let source_room: Room = Game.rooms[creep.memory.source_roomName]
    if (source_room == undefined){
        console.log(Game.time, "energy_harvester_with_carry_work", creep.memory.source_roomName, ' undefined')
        return
    }
    let source: Source = Game.getObjectById(source_room.memory.sources_id[creep.memory.source_idx])
    go_to_harvest(creep, source)
}