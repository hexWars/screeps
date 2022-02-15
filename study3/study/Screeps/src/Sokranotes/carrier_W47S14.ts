export const carrier_W47S14_work = function(creep: Creep){
    // creep.say('🔄 Here');
    if (creep.pos.x != 8 || creep.pos.y != 19)
    {
        creep.moveTo(new RoomPosition(8, 19, 'W47S14'), {visualizePathStyle: {stroke: '#00ff0e'}})
    }
    else{
        if (creep.memory.dontPullMe == undefined){
            creep.memory.dontPullMe = true;
        }
        let link: StructureLink = Game.getObjectById("6159d59ae59fcf2038ecf56c")
        let upgrade_link: StructureLink = Game.getObjectById('615a13005237858c5056f75f')
        let storage: StructureStorage = creep.room.storage
        let terminal: StructureTerminal = creep.room.terminal

        if (upgrade_link.store.getUsedCapacity(RESOURCE_ENERGY) <= 30 && link.cooldown < 3){
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                creep.withdraw(storage, RESOURCE_ENERGY)
            }
            else{
                creep.transfer(link, RESOURCE_ENERGY)
            }
            return
        }
        if (link.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                creep.withdraw(link, RESOURCE_ENERGY)
            }
            else{
                if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > terminal.store.getUsedCapacity(RESOURCE_ENERGY) && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                    creep.transfer(terminal, RESOURCE_ENERGY)
                }
                else{
                    creep.transfer(storage, RESOURCE_ENERGY)
                }
            }
        }
        else{
            if ((terminal.store.getUsedCapacity(RESOURCE_ENERGY) <= 80000 && storage.store.getUsedCapacity(RESOURCE_ENERGY) > terminal.store.getUsedCapacity(RESOURCE_ENERGY)) ||
            (storage.store.getFreeCapacity(RESOURCE_ENERGY) < 10000)){
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                    creep.withdraw(storage, RESOURCE_ENERGY)
                }
                else{
                    creep.transfer(terminal, RESOURCE_ENERGY)
                }
            }
            else if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 85000 && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 5000){
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                    creep.withdraw(terminal, RESOURCE_ENERGY)
                }
                else{
                    creep.transfer(storage, RESOURCE_ENERGY)
                }
            }
            // else if (terminal.store.getFreeCapacity() < 5000 && storage.store.getFreeCapacity() < 5000){
            //     Game.rooms['W47S14'].terminal.send(RESOURCE_ENERGY, 50000, 'W48S12', 'free')
            //     if (Game.time%2 == 0){
            //         Game.rooms['W47S14'].terminal.send(RESOURCE_ENERGY, 20000, 'W41S11', 'free')
            //         console.log(Game.time, 'send', 'W41S11', '20000')
            //     }
            //     else{
            //         Game.rooms['W47S14'].terminal.send(RESOURCE_ENERGY, 20000, 'W39S23', 'free')
            //         console.log(Game.time, 'send', 'W39S23', '20000')
            //     }
            //     // Game.rooms['W47S14'].terminal.send(RESOURCE_ENERGY, 20000, 'E39S51', 'free')
            //     // W44S2 mikumikumiku
            // }
        }
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) != 0){
            if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > terminal.store.getUsedCapacity(RESOURCE_ENERGY) && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                creep.transfer(terminal, RESOURCE_ENERGY)
            }
            else{
                creep.transfer(storage, RESOURCE_ENERGY)
            }
        }
    }
}