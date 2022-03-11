
export const p_creep = function () {
	_.assign(Creep.prototype, creepExtension)
}


const creepExtension = {
	/**
	 * creep执行
	 */
	work: function () {
		// 如果 creep 还没有发送重生信息的话，执行健康检查，保证只发送一次生成任务
		// 健康检查不通过则向 spawnList 发送自己的生成任务
		if (!this.memory.hasSendRebirth) {
			const health = this.isHealthy()
			if (!health) {
				//todo 向指定 spawn 推送生成任务
				this.memory.hasSendRebirth = true
				Game.spawns[this.memory.spawnName].addTask(this.memory);
			}
		}
	},
	/**
	 * creep更新重生标记的时间限制
	 * @return {boolean}
	 */
	isHealthy: function() {
		return this.ticksToLive > 100;
	},
	/**
	 * 填充所有 spawn 和 extension
	 * @return boolean
	 */
	fillSpawnEnergy() {
		// let targets = this.room.extensionsAndSpawn()
		// if (targets.length > 0) {
		// 	if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
		// 		this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
		// 	}
		// 	return false
		// } else {
		// 	return true
		// }
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: function (obj) {
				return (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN)
					&& obj.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			}
		})
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
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
		let target = this.room.storage
		if (target) {
			for(const resourceType in this.store) {
				if (this.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
					this.moveTo(target)
				}
				// if (this.store.getUsedCapacity() == 0) {
				// 	break
				// }
			}
			// if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			// 	this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			// }
		}
	},
	/**
	 * 填充所有 tower
	 * 全部填充返回true
	 * @return boolean
	 */
	fillTower() {
		let targets = this.room.towers()
		if (targets) {
			// console.log(this.transfer(target, RESOURCE_ENERGY))
			if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
			}
			return false
		} else {
			return true
		}
	},
	/**
	 * 修理所有建筑,除了墙
	 */
	buildAllStructures() {

	},
	/**
	 * 采集能量
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
			this.moveTo(exit, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 60});
			return false
		}
	}

}



