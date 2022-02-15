/* 
reqiure:
room
room.memory.towers.id

set:
room.memory.war_flag

action:
notifyWhenAttacked tower
activateSafeMode
*/

export const check_towers_id = function(room: Room){
    let towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER
        }
    })
    if (towers.length > 0){
        Memory.rooms[room.name].towers_id = new Array(towers.length)
        for (let i: number = 0; i < towers.length; i++){
            Memory.rooms[room.name].towers_id[i] = towers[i].id;
        }
    }
}

export const tower_work = function(roomName: string){
    let flag: Boolean = false
    if (Game.flags.check_towers_id_flag && Game.flags.check_towers_id_flag.room.name == roomName){
        flag = true
        Game.flags.check_towers_id_flag.remove()
    }
    if (Game.rooms[roomName].memory.war_flag != true && Game.time % 5 != 0 && !flag) return
    check_towers_id(Game.rooms[roomName])
    
    let room = Game.rooms[roomName]
    let tower_list = room.memory.towers_id
    if (global.white_list == undefined){
        global.white_list  = new Set([]);
    }
    let closestHostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => (!global.white_list.has(creep.owner.username))
    });
    let structures: Structure[]
    if(closestHostiles.length == 0){
        structures = room.find(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < 0.8*structure.hitsMax  
                        && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD
                    });
    }
    // Tower防御及safe mode的激活
    for (let tower_id in tower_list){
        let tower: StructureTower = Game.getObjectById(tower_list[tower_id])
        if (tower){
            if (tower.notifyWhenAttacked(true) == OK && tower.hits <= 0.6*tower.hitsMax)
            {
                room.controller.activateSafeMode()
            }
            if(tower) {
                if(closestHostiles.length > 0) {
                    if (tower.room.memory.war_flag == false){
                        console.log(Game.time, roomName, '发现敌军' + closestHostiles.length + closestHostiles[0].owner.username)
                    }
                    tower.room.memory.war_flag = true
                    tower.attack(closestHostiles[0]);
                }
                else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 0.7*tower.store.getCapacity(RESOURCE_ENERGY)){
                    tower.room.memory.war_flag = false
                    if(structures.length > 0) {
                        tower.repair(structures[0]);
                    }
                }
            }
        }
    }
}