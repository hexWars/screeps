export const tower_work = function(roomName: string){
    if (Game.rooms[roomName] == undefined){
        console.log('tower work 23 room seems undefined')
        return
    }

    // Tower防御及safe mode的激活
    let tower_list: string[]
    let spawn_list: string[]
    if (roomName == 'W47S14'){
        tower_list = ['6159d77e4f3a51396dd2fcfe', '615a15ea8e77705c01ebc303', '615bec8f3d8c500c57d69377', 
        '617804aef64f5ec49c53815c', '6177f52de45f2bc4bc185170', '61779f21b96f375a682351c3']
        spawn_list = ['Spawn1', 'Spawn3']
    }
    else if (roomName == 'W48S12'){
        tower_list = ['6159ce743a785c3da4b22def', '617439daae86fb256a426b47']
        spawn_list = ['Spawn2']
    }
    for (let spawn_id in spawn_list){
        if (Game.spawns[spawn_list[spawn_id]]){
            if (Game.spawns['Spawn3'].hits <= 0.5*Game.spawns['Spawn3'].hitsMax)
            {
                Game.rooms[roomName].controller.activateSafeMode()
            }
        }
    }
    let closestHostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => (!global.white_list.has(creep.owner.username))
    });
    let ramparts: StructureRampart[]
    let structures: Structure[]
    let ramparts_walls: Structure[]
    if(closestHostiles.length == 0){
        if (roomName == 'W48S12'){
            structures = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => (structure.hits < 0.9*structure.hitsMax  
                && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) || 
                (structure.hits < 10000 && structure.pos.x >= 9 && structure.pos.x <= 26 && structure.pos.y > 32 && (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART))
            });
        }
        else{
            structures = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < 0.9*structure.hitsMax  
                && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
            });
        }
    }
    // if(closestHostiles.length == 0){
    //     ramparts = Game.rooms[roomName].find(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < 1000000  && (structure.structureType == STRUCTURE_RAMPART)
    //     });
    //     if(ramparts.length == 0) {
    //         structures = Game.rooms[roomName].find(FIND_STRUCTURES, {
    //             filter: (structure) => structure.hits < structure.hitsMax  
    //             && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
    //         });
    //         if (structures.length == 0){
    //             ramparts_walls = Game.rooms[roomName].find(FIND_STRUCTURES, {
    //                 filter: (structure) => structure.hits < structure.hitsMax  
    //                 && structure.structureType != STRUCTURE_WALL
    //                 && structure.structureType != STRUCTURE_RAMPART
    //             });
    //         }
    //     }
    // }
    for (let tower_id in tower_list){
        let tower: StructureTower = Game.getObjectById(tower_list[tower_id])
        if (tower){
            if (tower.hits <= 0.5*tower.hitsMax)
            {
                Game.rooms[roomName].controller.activateSafeMode()
            }
            if(tower) {
                if(closestHostiles.length > 0) {
                    if (tower.room.memory.war_flag == false){
                        console.log(Game.time, roomName, ' 发现敌军' + closestHostiles.length + closestHostiles[0].owner.username)
                    }
                    tower.room.memory.war_flag = true
                    tower.attack(closestHostiles[0]);
                }
                else if (!(tower.store.getUsedCapacity(RESOURCE_ENERGY) < 0.6*tower.store.getCapacity(RESOURCE_ENERGY))){
                    tower.room.memory.war_flag = false
                    if(structures.length > 0) {
                        tower.repair(structures[0]);
                    }
                    else if (roomName == 'W47S14'){
                        let storage: StructureStorage = Game.getObjectById("6159fc1609f790175f45c6be")
                        let terminal: StructureTerminal = Game.getObjectById('615ab4e746872376a3726f6f')
                        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 140000 && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 500000)
                        {
                            ramparts = Game.rooms[roomName].find(FIND_STRUCTURES, {
                                filter: (structure) => structure.hits < 1000000  && (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL)
                                && structure.id != '6144f713fac820efe7cd23bc'
                            });
                            if(ramparts.length == 0) {
                                structures = Game.rooms[roomName].find(FIND_STRUCTURES, {
                                    filter: (structure) => structure.hits < structure.hitsMax  
                                    && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
                                });
                                if (structures.length == 0){
                                    ramparts_walls = Game.rooms[roomName].find(FIND_STRUCTURES, {
                                        filter: (structure) => structure.hits < structure.hitsMax  
                                        && structure.structureType != STRUCTURE_WALL
                                        && structure.structureType != STRUCTURE_RAMPART
                                    });
                                }
                            }
                            if(ramparts.length > 0) {
                                tower.repair(ramparts[0]);
                            }
                            else{
                                if(structures.length > 0) {
                                    tower.repair(structures[0]);
                                }
                                else{
                                    if(ramparts_walls.length > 0) {
                                        tower.repair(ramparts_walls[0]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}