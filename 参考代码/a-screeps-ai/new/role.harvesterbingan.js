var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleHarvesterbingan = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER||
                        structure.structureType == STRUCTURE_STORAGE) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        const sources = Game.getObjectById(creep.memory.sourceId);
	    if(creep.store.getFreeCapacity() > 0) {            
            if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources);
            }
            if(targets&&targets.hits / targets.hitsMax <= 0.5){
                creep.repair(targets);
            }
        }
        else {
            if(targets) {
                if(creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets);
                }
            }else if(creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3).length){
                roleBuilder.run(creep);
            }else {roleUpgrader.run(creep);}
        }
	}
};

module.exports = roleHarvesterbingan;