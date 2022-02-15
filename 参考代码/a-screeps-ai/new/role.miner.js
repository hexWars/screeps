var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const minerals = creep.room.mineral
        let container = Game.getObjectById(Memory.minerals[creep.room.name].container);
        var type = minerals.mineralType;
        if(container&&container.store[type]<2000){
            if (creep.pos.isEqualTo(container.pos)) {                   
                creep.harvest(minerals);                     
            }
            else {
                creep.moveTo(container);
            }           
        }
    }        
};

module.exports = roleMiner;