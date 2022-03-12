import {mount} from "../../mount";

export const role_occupier = function (creep) {
	mount()
	//todo 降低(攻击),占领以及签名,之后进行建造

	if (creep.room == Game.rooms["E19S54"]) {
		if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
			// creep.moveTo(new RoomPosition(14, 42, 'E59N12'))
			creep.moveTo(Game.rooms["E19S54"].controller)
			// creep.signController(Game.rooms["E59N12"].controller, "Bug fixes")
		}
		// if (creep.attackController(creep.room.controller) === ERR_NOT_IN_RANGE) {
		// 	// creep.moveTo(new RoomPosition(14, 42, 'E59N12'))
		// 	creep.moveTo(Game.rooms["E19S54"].controller)
		// 	// creep.signController(Game.rooms["E59N12"].controller, "Bug fixes")
		// }
		// if(creep.room.controller) {
		// 	if(creep.signController(creep.room.controller, "BNUZ") == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(creep.room.controller);
		// 	}
		// creep.signController(creep.room.controller, "Every little helps.")
		// }
	} else {
		creep.to_room("E19S54")
	}
	// if(creep.signController(creep.room.controller, "Bug fixes") == ERR_NOT_IN_RANGE) {
	// 	creep.moveTo(creep.room.controller);
	// }


	// if (creep.store.getFreeCapacity() == 100) {//可用容量没了 target
	// 	if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
	// 		// var targets = creep.room.find(FIND_RUINS);
	// 		// if (targets.length > 0) {
	// 		// 	let x = 5;
	// 		// 	console.log(creep.withdraw(targets[x], RESOURCE_ENERGY))
	// 		// 	if (creep.withdraw(targets[x], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
	// 		// 		creep.moveTo(targets[x], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
	// 		// 	}
	// 		// } else {
	// 			var target = Game.getObjectById(creep.memory.selfId)
	// 			if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
	// 				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
	// 			}
	// 		// }
	//
	// 	} else {
	// 		creep.to_room(creep.memory.selfRoomName)
	// 	}
	// } else {// self
	// 	if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
	// 		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	// 		if (targets.length > 0) {
	// 			if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
	// 				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
	// 			}
	// 		}
	// 	} else {
	// 		creep.to_room(creep.memory.targetRoomName)
	// 	}
	// }

	if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
		// if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
		// 	creep.memory.building = false;
		// 	creep.say('🔄 harvest');
		// }
		// if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
		// 	creep.memory.building = true;
		// 	creep.say('🚧 build');
		// }
		//
		// if (creep.memory.building) {
		// 	var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		// 	if (targets.length) {
		// 		if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
		// 			creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
		// 		}
		// 	}
		// } else {
		// 	var sources = creep.room.find(FIND_SOURCES);
		// 	if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
		// 	}
		// }


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
	} else {
		creep.to_room(creep.memory.targetRoomName)
	}


}

