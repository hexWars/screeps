var roleBuilder = {

	/** @param {Creep} creep **/
	run: function (creep) {

		if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.building = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
			creep.memory.building = true;
			creep.say('🚧 build');
		}

		if (creep.memory.building) {
			// FIND_MY_CONSTRUCTION_SITES 所有属于您的建筑地
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
			if (targets.length > 0) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		} else {
			var sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
};

module.exports = roleBuilder;
