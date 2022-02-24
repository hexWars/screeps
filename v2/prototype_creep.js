module.exports = function () {
	_.assign(Creep.prototype, creepExtension)
}


const creepExtension = {
	/**
	 * 自定义敌人检测
	 * @param type 选择类型
	 * 1: 最近的
	 * @returns {target} 目标对象
	 */
	checkEnemy(type = 1) {
		if (type == 1) {
			var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target) {
				return target
			} else {
				return undefined
			}
		} else {

		}
	},
	/**
	 * 填充所有 spawn 和 extension
	 * @return 填充完成返回true
	 */
	fillSpawnEnergy() {
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_EXTENSION
						|| structure.structureType === STRUCTURE_SPAWN
					) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
			return false
		} else {
			return true
		}
	},
	/**
	 * 填充仓库
	 */
	fillStorage () {
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_STORAGE
					) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
			return true
		} else {
			return false
		}
	},
	/**
	 * 填充所有 tower
	 * @return boolean 全部填充返回true
	 */
	fillTower() {
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_TOWER) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (target) {
			// console.log(this.transfer(target, RESOURCE_ENERGY))
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
			return false
		} else {
			return true
		}
	},
	/**
	 *
	 */
	buildAllStructures() {
		var target = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
		if (target) {
			if (this.build(target) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, opts);
			}
			return true
		}
		return false
	},
	/**
	 *
	 * @param obj 资源对象
	 */
	harvestEnergy(obj) {

	},
	/**
	 * 去往内存中的targetRoomName
	 * @param roomName 去往的房间名
	 * @return {boolean}
	 */
	to_room(roomName) {
		if (this.room == Game.rooms[roomName]) {
			return true
		} else {
			const exitDir = this.room.findExitTo(roomName);// 找到通往另一个房间的出口方向
			const exit = this.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
			this.moveTo(exit);
			return false
		}
	}

}



