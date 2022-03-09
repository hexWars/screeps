import {p_room} from "../prototype_room";

export const p_tower = function () {
	_.assign(StructureTower.prototype, towerExtension)
}

//todo 发现敌人放到room里写
const towerExtension = {

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
		this.attack()
		// 治疗creep
		this.healCreep()
	},
	attack: function () {
		var creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		if (creep) {
			this.attack(creep)
		}
	},
	healCreep: function () {
		var creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		})
		if (creep) {
			this.heal(creep)
		}
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
						&& structure.hits < 5000
					// return structure.hits < structure.hitsMax
				}
			});
			if (structure) {
				this.repair(structure);
			}
		}
	}
}



