var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
		if (creep.goToRoom(creep.memory.target)){
            let closestDamagedStructure = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: s => s.structureType == STRUCTURE_RAMPART
            });
            closestDamagedStructure.sort((a,b) => a.hits - b.hits);
            if(closestDamagedStructure.length>0){
                creep.moveTo(closestDamagedStructure[0]);
                creep.dismantle(closestDamagedStructure[0]);
            }
            creep.moveTo(creep.room.controller);
            
        }
	}
};
module.exports = roleWorker;