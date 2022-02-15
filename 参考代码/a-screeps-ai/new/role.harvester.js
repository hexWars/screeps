var roleBuilder = require('role.builder');

var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {   
        const sources = Game.getObjectById(creep.memory.sourceId);
        let linker = Game.getObjectById(creep.memory.linkerId);
        let container = Game.getObjectById(creep.memory.containerId);
        if(container&&container.store[RESOURCE_ENERGY]<2000){
            if (creep.pos.isEqualTo(container.pos)) {
                creep.memory.no_pull=true
                if(sources.energy>0){
                    if(container.hits / container.hitsMax <= 0.5){
                        creep.repair(container);
                    }else if(linker){
                        creep.transfer(linker,RESOURCE_ENERGY);
                    }else if(container){
                        creep.transfer(container,RESOURCE_ENERGY);
                    } 
                    creep.harvest(sources);                         
                }          
            }
            else {creep.moveTo(container);}           
        }
        else if(!container){
            let mycontainer = sources.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            })[0];
            if(!mycontainer&&creep.pos.isNearTo(sources)&&creep.pos.findInRange(FIND_CONSTRUCTION_SITES,2).length==0){
                creep.room.createConstructionSite(creep.pos,STRUCTURE_CONTAINER)
            }else if(!creep.pos.isNearTo(sources)){creep.moveTo(sources)}
            if(creep.pos.isNearTo(sources))roleBuilder.run(creep); 
        } 
    }        
};
module.exports = roleHarvester;
