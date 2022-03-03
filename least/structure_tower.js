const prototype = require("./prototype");

let role = {
	/**
	 * 塔的维修和攻击
	 * @param tower 塔的对象
	 */
	run: function (tower) {
		prototype()
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
		}
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
	}
}

module.exports = role;
