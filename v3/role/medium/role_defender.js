import {mount} from "../../mount";


export const role_defender = function (creep) {
		mount()
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target) {
				if (creep.attack(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				if (creep.attack(Game.getObjectById("622898208de18e47ef24d8df")) === ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById("622898208de18e47ef24d8df"), {visualizePathStyle: {stroke: '#ffaa00'}});
				}
				// let x = Math.ceil(Math.random() * 40)
				// let y = Math.ceil(Math.random() * 40)
				// creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
}

