import {mount} from "../../mount";


export const roleCenter = function (creep) {
	mount()

	if (!link_to_storage(creep)) {
		storage_to_terminal(creep, RESOURCE_HYDROGEN)
	}

	//
	// 		//todo 转移资源
	// 		//toTerminal(creep)
	// 		//toStorage(creep)
	//
	// 		// RESOURCE_HYDROGEN
}

/**
 * 把link中的能量转移
 * @param creep
 * @return boolean
 */
function link_to_storage(creep) {
	var link = Game.getObjectById(creep.memory.selfId)
	if (link.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		return false
	}
	if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId)// 存放的Id
			for (let sources in target.store) {
				if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	} else {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(link, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	}
	return true
}

/**
 * 资源从storage转移至terminal
 * @param creep
 * @param sources
 */
function storage_to_terminal(creep, sources) {
	if (creep.store.getFreeCapacity() == 0) {
		if(creep.transfer(creep.room.terminal, sources) === ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.terminal);
		}
	} else {
		if(creep.withdraw(creep.room.storage, sources) === ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.storage);
		}
	}
}
function toStorage(creep) {
	if (creep.store.getFreeCapacity() == 0) {
		if(creep.transfer(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(this.room.storage);
		}
	} else {
		if(creep.withdraw(this.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(this.room.terminal);
		}
	}
}

