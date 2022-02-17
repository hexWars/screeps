var tower = {
	/**
	 * @param tower_id 塔的id
	 */
	run: function (tower_id) {
		let tower = Game.getObjectById(tower_id);
		if (tower) {
			// findClosestByRange 查找到该位置线性距离最短的对象
			var structures = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax
			});
			if (structures > 0) {
				// repair 远程维修房间里的任意建筑
				let x = tower.repair(structures[x])
				console.log("维修:" + structures[x].pos + " 结果为:" + x);
			} else {
				console.log("塔未找到维修目标")
			}

			// const targets = creep.room.find(FIND_STRUCTURES, {
			// 	filter: object => object.hits < object.hitsMax
			// });
			//
			// targets.sort((a,b) => a.hits - b.hits);
			//
			// if(targets.length > 0) {
			// 	if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
			// 		creep.moveTo(targets[0]);
			// 	}
			// }

			// FIND_HOSTILE_CREEPS 寻找敌对creeps(最近的)
			var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (closestHostile) {
				console.log("发现敌人:" + closestHostile.pos)
				tower.attack(closestHostile);
			}
		} else {
			console.log("未找到塔")
		}
	}
};

module.exports = tower;
