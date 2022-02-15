var roleMover = require('role.mover');
var roleMover2 ={ 
    /** @param {Creep} creep **/
    run: function(creep) {   
        //转运矿物
        const minerals = Game.getObjectById(creep.memory.minerID);
        let container = Game.getObjectById(Memory.minerals[creep.room.name].container);
        var minat1 = creep.room.terminal
        var type = minerals.mineralType;      
        if (creep.goToRoom(minerals.room.name)) {
            if((minerals.mineralAmount==0||container.store[type]<creep.store.getCapacity()||creep.store[RESOURCE_ENERGY]>0)&&creep.store[type]==0){
                roleMover.run(creep)
            }else{
                //转运矿物
                if(minerals.mineralAmount>0&&container){
                    if(container.store[type]>=creep.store.getCapacity()&&creep.store.getFreeCapacity()>0){
                        if(creep.withdraw(container, type) == ERR_NOT_IN_RANGE){
                        creep.moveTo(container)
                        }
                    }else{  
                        for(const resourceType in creep.store) {
                            if(minat1&&minat1.store.getFreeCapacity() > 0&&creep.transfer(minat1,resourceType) == ERR_NOT_IN_RANGE){
                                creep.moveTo(minat1);                    
                            }
                        }              
                    }
                } 
            }
        }          
    }    
}
module.exports = roleMover2;