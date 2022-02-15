var roleMover1 ={
    /** @param {Creep} creep **/
    run: function(creep) {
        //塔能量；
        if(Memory.mover[creep.room.name]&&Game.getObjectById(Memory.mover[creep.room.name].tcontainer)){
            var targets=Game.getObjectById(Memory.mover[creep.room.name].tcontainer)
            if(!creep.pos.isEqualTo(targets)){creep.moveTo(targets)}
            var targets2 = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });      
            targets2.sort((a,b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);       
            if(targets2.length>0&&creep.store[RESOURCE_POWER]==0){
                if(targets&&targets.store[RESOURCE_ENERGY]>0){
                    if(creep.withdraw(targets,RESOURCE_ENERGY)== ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets);
                    }
                }                    
                if(creep.transfer(targets2[0],RESOURCE_ENERGY)== ERR_NOT_IN_RANGE&& creep.store[RESOURCE_ENERGY] > 0) {
                    creep.moveTo(targets2[0]);
                }
            }
        }        
    }    
}
module.exports = roleMover1;