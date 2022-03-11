import {mount} from "../../mount";


export const roleCenter = function (creep) {
	mount()
	if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId)
			if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
			}
		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	} else {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId)
			if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
			} else {
				//todo 转移资源
				// toTerminal(creep)
				// toStorage(creep)
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	}

}

function toTerminal(creep) {
	if (creep.store.getFreeCapacity() == 0) {
		if(creep.transfer(this.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(this.room.terminal);
		}
	} else {
		if(creep.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(this.room.storage);
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

