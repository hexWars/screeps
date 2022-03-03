const prototype = require("./prototype");

let role = {
	/**
	 * 塔的维修和攻击
	 * @param tower 塔的对象
	 */
	run: function (tower) {
		prototype()
		var creep = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		if (creep) {
			tower.attack(creep)
		}
		creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		})
		if (creep) {
			tower.heal(creep)
		}
	},
	run_1: function (tower) {
		prototype()
		// 搜索敌人并打击
		var creep = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		if (creep) {
			tower.attack(creep)
		}
		// 治疗creep
		creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		})
		if (creep) {
			tower.heal(creep)
		}
		// 维修
		var structure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: function (structure) {
				return (structure.structureType != STRUCTURE_WALL
						&& structure.structureType != STRUCTURE_RAMPART)
					&& structure.hits < (structure.hitsMax* 3 / 5)
				// return structure.hits < structure.hitsMax
			}
		});
		if (structure) {
			tower.repair(structure);
		} else {
			structure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: function (structure) {
					return (structure.structureType == STRUCTURE_WALL
							|| structure.structureType == STRUCTURE_RAMPART)
						&& structure.hits < 5000
					// return structure.hits < structure.hitsMax
				}
			});
			if (structure) {
				tower.repair(structure);
			}
		}
	}
}

module.exports = role;
