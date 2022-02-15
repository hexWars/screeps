export const go_to_repair = function(creep: Creep, wall_rampart_hits?: number, filter?: Object){
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.hits < 10000) && (s.structureType == STRUCTURE_RAMPART)
    });
    if(target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return
    }
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.hits < 10000) && (s.structureType == STRUCTURE_WALL)
    });
    if(target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return
    }

    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.hits < 0.7*s.hitsMax && s.structureType == STRUCTURE_ROAD) || (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART  && s.structureType != STRUCTURE_ROAD)
    });
    if(target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        return
    }

    if (filter == undefined){
        let wall_rampart_hits_ladder = [100000, 1000000, 10000000, 50000000, 100000000]
        for (let i = 0; i < wall_rampart_hits_ladder.length; i++){
            if (wall_rampart_hits != undefined){
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.hits < wall_rampart_hits && s.hits < 0.9*s.hitsMax && s.hits < wall_rampart_hits_ladder[i]) && (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL)
                });
            }
            else{
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.hits < 0.9*s.hitsMax && s.hits < wall_rampart_hits_ladder[i]) && (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL)
                });
            }
            if(target) {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return
            }
        }
    }
    else{
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, filter);
        if(target) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return
        }
    }
    creep.memory.role = 'hb'
}
