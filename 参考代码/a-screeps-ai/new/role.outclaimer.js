var roleOutclaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.goToRoom(creep.memory.target)){
            if(creep.room.controller && !creep.room.controller.my) {
                if(creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
            if(creep.room.controller && creep.room.controller.my){
                if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }            
        }
     
	}
};

module.exports = roleOutclaimer;