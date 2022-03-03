const prototype = require("./prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		//todo 能量不够放能量
		// 掉落的能量
		// 墓地
		// 废墟
		// 刷墙

		let all = Game.spawns['Spawn1'].store[RESOURCE_ENERGY]
		var targets = creep.room.find(FIND_MY_STRUCTURES, {
			filter: function (obj) {
				return obj.structureType === STRUCTURE_EXTENSION;
			}
		})
		for (let x of targets) {
			all += x.store[RESOURCE_ENERGY]
		}

	}
}

module.exports = role;
