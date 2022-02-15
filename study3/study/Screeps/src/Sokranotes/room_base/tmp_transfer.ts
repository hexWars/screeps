export const tmp_transfer_work = function(creep: Creep){
    let container: StructureContainer = Game.getObjectById("61c0dd7d28ba3c10a221bae0")
    if (container.store.getUsedCapacity() != 0){
        if (creep.room.name != 'W46S15') creep.moveTo(new RoomPosition(25, 25, 'W46S15'))
        else {
            if (creep.pos.x < 1) creep.moveTo(new RoomPosition(25, 25, 'W46S15'))
            let code = creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_PURIFIER)
            if (code == ERR_NOT_IN_RANGE){
                creep.moveTo(new RoomPosition(21, 30, 'W46S15'))
            }
            else {
                if (creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_UTRIUM_BAR) != OK){
                    creep.withdraw(Game.getObjectById('61c0dd7d28ba3c10a221bae0'), RESOURCE_LIQUID)
                }
            }
        }
    }
    else{
        let code = creep.transfer(Game.rooms['W47S14'].storage, RESOURCE_PURIFIER)
        if (code == ERR_NOT_IN_RANGE){
            creep.moveTo(new RoomPosition(21, 30, 'W46S15'))
        }
        else {
            if (creep.transfer(Game.rooms['W47S14'].storage, RESOURCE_PURIFIER) != OK){
                creep.transfer(Game.rooms['W47S14'].storage, RESOURCE_PURIFIER)
            }
        }
    }
}