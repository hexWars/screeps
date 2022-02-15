export const dismate_work = function(creep: Creep){
    // creep.say('🔄 dismate');
    if (creep.room.name != 'W48S16'){
        creep.moveTo(new RoomPosition(25, 25, 'W48S16'), {visualizePathStyle: {stroke: '#ff0000'}})
    }
    else{
        var rampart: StructureRampart = Game.getObjectById('5d39daa8c5206e40b17e457d')
        console.log(rampart == undefined)
        if (rampart != undefined){
            if (creep.dismantle(rampart) != OK){
                creep.moveTo(rampart)
            }
            else{
                var tower: StructureTower = Game.getObjectById('6149ed5994d2166b95ff96f9')
                if (tower != undefined){
                    if (creep.dismantle(tower) != OK){
                        creep.moveTo(tower)
                    }
                }
                else{
                    var spawn: StructureSpawn = Game.getObjectById('6145fd8fe886cf49a9e73f64')
                    if (spawn != undefined){
                        if (creep.dismantle(spawn) != OK){
                            creep.moveTo(spawn)
                        }
                    }
                    else{
                        var controller: StructureController = Game.getObjectById('5bbcaa729099fc012e631612')
                        if (controller != undefined){
                            if (creep.dismantle(controller) != OK){
                                creep.moveTo(controller)
                            }
                        }
                    }
                }
            }
        }
    }
}