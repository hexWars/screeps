

module.exports = function () {
	_.assign(Creep.prototype, creepExtension)
	/**
	 * creep装满了吗
	 */
	Object.defineProperty(Creep.prototype, 'isFull', {
		get: function () {
			if (!this._isFull) {
				this._isFull = _.sum(this.store) === this.store.getCapacity();
			}
			return this._isFull;
		},
		enumerable: false,
		configurable: true
	});
	/**
	 * @return 所属房间对象
	 */
	Object.defineProperty(Creep.prototype, 'room', {
		get: function () {
			if (!this._room) {
				this._room = Game.rooms[this.memory.room]
			}
			return this._room;
		},
		enumerable: false,
		configurable: true
	});


	/**
	 * 重写moveTo方法
	 * apply 调用具有指定 this 值的函数，并将参数数组的每个元素作为该函数的参数传递
	 */
	// if (!Creep.prototype._moveTo) {
	// 	Creep.prototype._moveTo = Creep.prototype.moveTo;
	// 	Creep.prototype.moveTo = function (...myArgumentsArray) {
	// 		console.log(`My moveTo using rest parameters!`);
	//
	// 		let startCpu = Game.cpu.getUsed();
	// 		let returnValue = this._moveTo.apply(this, myArgumentsArray);
	// 		let endCpu = Game.cpu.getUsed();
	//
	// 		let used = endCpu - startCpu;
	//
	// 		if (!this.memory.moveToCPU) this.memory.moveToCPU = 0;
	//
	// 		this.memory.moveToCPU += used;
	//
	// 		return returnValue;
	// 	};
	// }
}


const creepExtension = {
	/**
	 * 自定义敌人检测
	 * @param type 选择类型
	 * 1: 最近的
	 * @param opts
	 * @returns {target} 目标对象
	 */
	checkEnemy(type = 1) {
		// 代码实现...
		if (type == 1) {
			var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target) {
				return target
			} else {
				moveTo(10, 10)
			}
		} else {

		}
	},
	/**
	 * 填充所有 spawn 和 extension
	 * @param opts
	 * @return 正常移动返回true,没目标返回false
	 */
	fillSpawnEnergy(opts = {visualizePathStyle: {stroke: '#ffffff'}}) {
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				// 母巢,拓展,塔,小容器,大容器
				return (structure.structureType === STRUCTURE_EXTENSION
						|| structure.structureType === STRUCTURE_SPAWN
					) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, opts);
			}
			return true
		} else {
			return false
		}
	},
	/**
	 * 填充所有 tower
	 * @param opts
	 */
	fillTower(opts = {visualizePathStyle: {stroke: '#ffffff'}}) {
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				// 母巢,拓展,塔,小容器,大容器
				return (structure.structureType === STRUCTURE_TOWER) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, opts);
			}
			return true
		} else {
			return false
		}
	},
	/**
	 * 寻找有能量的建筑并取出能量,包括墓碑,link,storage,container
	 * @param obj 建筑对象
	 * @param opts
	 */
	withdrawStructure(obj, opts = {visualizePathStyle: {stroke: '#ffffff'}}) {
		if (target) {
			if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, opts);
			}
		} else {
			this.say("未找到对象")
		}
	},
	/**
	 *
	 * @param opts
	 */
	buildAllStructures(opts = {visualizePathStyle: {stroke: '#ffffff'}}) {
		var target = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
		if (target) {
			if(this.build(target) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, opts);
			}
			return true
		}
		return false
	},
	/**
	 *
	 * @param obj 资源对象
	 * @param opts
	 */
	harvestEnergy(obj, opts = {visualizePathStyle: {stroke: '#ffffff'}}) {

	}

}



