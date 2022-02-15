var roleMoverout ={
    /** @param {Creep} creep **/
    run: function(creep) {    
        //搬外部能量；  
        if(creep.memory.moveing && creep.store.getUsedCapacity() == 0) {
            creep.memory.moveing = false;
        }
        if(!creep.memory.moveing && creep.store.getFreeCapacity() == 0) {
            creep.memory.moveing = true;
        }  
        var downsources = creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);        
        creep.pickup(downsources[0]);   
        var tombsources = creep.pos.findInRange(FIND_TOMBSTONES,1);
        creep.withdraw(tombsources[0],RESOURCE_ENERGY);
        if(creep.memory.moveing){
            if(creep.goToRoom(creep.memory.home)){      
                    var minat1 = creep.room.storage;
                    if(minat1.store.getFreeCapacity()>0){
                        if(creep.transfer(minat1,Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(minat1);
                        }
                    }else{
                        var tersour = Game.getObjectById(Memory.mover[creep.room.name].terminal);
                        if(creep.transfer(tersour,Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(tersour);
                        }
                    }               
                
            }
        }
        else if (creep.goToRoom(creep.memory.target)){
            var targets = creep.room.storage;
            if(targets){
                if(targets.store[RESOURCE_ENERGY]>0){
                    if(creep.withdraw(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets);  
                    }
                }else{
                    if(creep.withdraw(targets, Object.keys(targets.store)[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets);  
                    }
                }                                          
            }
        }                                
    }
}
module.exports = roleMoverout;