import {mount} from "../../mount";

/**
 * self 取资源
 * target 为controller的Id
 * @param creep
 */
export const role_upgrader = function (creep) {

	mount()
	if (creep.store[RESOURCE_ENERGY] == 0) {// 资源为0 self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId)
			if (target) {
				if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId)
			// if (creep.upgradeController(target) === ERR_NOT_IN_RANGE) {
			// 	creep.moveTo(target);
			// }
			creep.moveTo(target)
			creep.upgradeController(target)

		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	}
}

