import {mount} from "../../mount";

export const role_occupier = function (creep) {
	mount()
	//todo 降低(攻击),占领以及签名,之后进行建造

	if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
		if (creep.room.controller.my) {
			//todo 建造
			if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
				creep.memory.building = false;
				creep.say('🔄 harvest');
			}
			if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
				creep.memory.building = true;
				creep.say('🚧 build');
			}
			if (creep.memory.building) {
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (targets.length) {
					if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			} else {
				var sources = creep.room.find(FIND_SOURCES);
				if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			}

		} else {
			if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
				// creep.attackController(creep.room.controller)
				// creep.signController(creep.room.controller, "Bug fixes")
				creep.moveTo(creep.room.controller)
			}
		}

	} else {
		creep.to_room(creep.memory.selfRoomName)
	}


		// if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
		// 	creep.memory.upgrading = false;
		// 	creep.say('🔄 harvest');
		// }
		// if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
		// 	creep.memory.upgrading = true;
		// 	creep.say('⚡ upgrade');
		// }
		//
		// if (creep.memory.upgrading) {
		// 	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
		// 	}
		// } else {
		// 	// var sources = creep.room.find(FIND_SOURCES);
		// 	// if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		// 	// 	creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
		// 	// }
		//
		// 	var sources = creep.room.find(FIND_RUINS);
		// 	if (creep.withdraw(sources[2], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(sources[2], {visualizePathStyle: {stroke: '#ffaa00'}});
		// 	}
		// }

}

