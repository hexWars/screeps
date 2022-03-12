import {p_room} from "../prototype_room";

export const p_tower = function () {
	_.assign(StructureTower.prototype, towerExtension)
}

//todo 发现敌人放到room里写
const towerExtension = {

	//todo 指定范围维修,指定类型维修
	// 层次修墙(repairer做的)

	/**
	 * 塔的治疗和攻击
	 */
	run: function () {
		p_room()
		var creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		if (creep) {
			this.attack(creep)
		}
		creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		})
		if (creep) {
			this.heal(creep)
		}
	},
	run_1: function () {
		p_room()
		// 维修
		this.fixStructure()
		// 搜索敌人并打击
		this.attack_creep()
		// 治疗creep
		this.healCreep()
	},
	/**
	 * 单纯攻击
	 */
	run_attack: function () {
		this.attack_creep()
	},
	/**
	 * 范围修复加全局攻击
	 */
	run_range: function (range) {
		if (!this.attack_creep()) {
			//todo 治疗最近
			if (!this.healCreep()) {
				this.fix_range_structure(range)
			}
		}
	},
	/**
	 * 攻击敌人
	 * @return {boolean}
	 */
	attack_creep: function () {
		// var creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		var creep = this.room.checkEnemy()[0]
		if (creep) {
			if (this.attack(creep) === OK) {
				return true
			}
		}
		return false
	},
	healCreep: function () {
		var creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		})
		if (creep) {
			this.heal(creep)
			return true
		}
		return false
	},
	fixStructure: function () {
		var structure = this.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: function (structure) {
				return (structure.structureType != STRUCTURE_WALL
						&& structure.structureType != STRUCTURE_RAMPART)
					&& structure.hits < (structure.hitsMax* 4 / 5)
				// return structure.hits < structure.hitsMax
			}
		});
		if (structure) {
			this.repair(structure);
		} else {
			structure = this.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: function (structure) {
					return (structure.structureType == STRUCTURE_WALL
							|| structure.structureType == STRUCTURE_RAMPART)
						&& structure.hits < 1000
					// return structure.hits < structure.hitsMax
				}
			});
			if (structure) {
				this.repair(structure);
			}
		}
	},
	/**
	 *
	 * @param range
	 */
	fix_range_structure: function (range = 25) {
		//todo 添加container和rampart?
		let structures = this.pos.findInRange(FIND_STRUCTURES, range, {
			filter: function (structure) {
				return (structure.structureType != STRUCTURE_WALL
						&& structure.structureType != STRUCTURE_RAMPART)
					&& structure.hits < (structure.hitsMax* 4 / 5)
				// return structure.hits < structure.hitsMax
			}
		});
		if (structures.length > 0) {
			this.repair(structures[0]);
		} else {
			structures = this.pos.findInRange(FIND_STRUCTURES, range, {
				filter: function (structure) {
					return (structure.structureType == STRUCTURE_WALL
							|| structure.structureType == STRUCTURE_RAMPART)
						&& structure.hits < 300
					// return structure.hits < structure.hitsMax
				}
			});
			if (structures.length > 0) {
				this.repair(structures[0]);
			}
		}
	}
}



