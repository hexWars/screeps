var tower = {
	/**
	 * @param tower_id 塔的id
	 */
	run: function (tower_id) {
		let tower = Game.getObjectById(tower_id);
		if (tower) {
			// findClosestByRange 查找到该位置线性距离最短的对象
			var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax
			});
			if (closestDamagedStructure) {
				// repair 远程维修房间里的任意建筑
				tower.repair(closestDamagedStructure);
			}

			// FIND_HOSTILE_CREEPS 寻找敌对creeps(最近的)
			var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (closestHostile) {
				tower.attack(closestHostile);
			}
		}
	}
};

module.exports = tower;
