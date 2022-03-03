module.exports = function () {
	_.assign(Creep.prototype, extension)
}


const extension = {
	/**
	 * 缓存所有spawn和extension的位置
	 * @param roomName
	 * @return {*} 返回对象数组
	 */
	allSpawnExtensionPos: function (roomName) {
		if (_.isUndefined(Memory.allSpawnExtensionPos)) {
			Memory.allSpawnExtensionPos = {}
		}
		if (_.isUndefined(Memory.allSpawnExtensionPos[roomName])) {
			Memory.allSpawnExtensionPos[roomName] = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return obj.structureType === STRUCTURE_EXTENSION
						|| obj.structureType === STRUCTURE_SPAWN
				}
			});
		}
		return Memory.allSpawnExtensionPos[roomName]
	},
	/**
	 * 返回所有需要维护的建筑(不包括wall和rempart)
	 * @param roomName
	 * @return {*} 返回对象数组
	 */
	allFixPos: function (roomName) {
		if (_.isUndefined(Memory.allFixPos)) {
			Memory.allFixPos = {}
		}
		if (_.isUndefined(Memory.allFixPos[roomName])) {
			Memory.allFixPos[roomName] = Game.rooms[roomName].find(FIND_STRUCTURES, {
				filter: function (obj) {
					return (obj.structureType != STRUCTURE_WALL
						&& obj.structureType != STRUCTURE_RAMPART)
						&& obj.hits < obj.hitsMax * 7 / 10
				}
			});
		}
		return Memory.allFixPos[roomName]
	},
	/**
	 * 所有带攻击部件的敌人的位置
	 * @param roomName
	 * @return {*} 返回对象数组
	 */
	enemyPos: function (roomName) {
		if (_.isUndefined(Memory.enemyPos)) {
			Memory.allFixPos = {}
		}
		if (_.isUndefined(Memory.enemyPos[roomName])) {
			Memory.enemyPos[roomName] = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
				filter: function (obj) {
					for (let i in obj.body) {
						if (i.type == ATTACK || i.type == RANGED_ATTACK) {
							return true
						}
					}
					return false
				}
			});
		}
		return Memory.enemyPos[roomName]
	},
	//todo 未建成的建筑,塔
	towerPos: function (roomName) {
		if (_.isUndefined(Memory.towerPos)) {
			Memory.allFixPos = {}
		}
		if (_.isUndefined(Memory.towerPos[roomName])) {
			Memory.towerPos[roomName] = Game.rooms[roomName].find(FIND_STRUCTURES, {
				filter: function (obj) {
					return obj.structureType === STRUCTURE_TOWER
					&& obj
					//todo 补充能量逻辑
				}
			});
		}
		return Memory.towerPos[roomName]
	},
	/**
	 * creep执行
	 */
	work: function () {
		// ...
		// 如果 creep 还没有发送重生信息的话，执行健康检查，保证只发送一次生成任务
		// 健康检查不通过则向 spawnList 发送自己的生成任务
		if (!this.memory.hasSendRebirth) {
			const health = this.isHealthy()
			if (!health) {
				// 向指定 spawn 推送生成任务
				// ...
				this.memory.hasSendRebirth = true
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
	 * 自定义敌人检测
	 * @returns {target} 目标对象
	 */
	checkEnemy() {

	},
	/**
	 * 填充所有 spawn 和 extension
	 * @return 填充完成返回true
	 */
	fillSpawnEnergy() {

	},
	/**
	 * 填充仓库
	 */
	fillStorage () {

	},
	/**
	 * 填充所有 tower
	 * @return boolean 全部填充返回true
	 */
	fillTower() {

	},
	/**
	 *
	 */
	buildAllStructures() {

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
			this.moveTo(exit, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 50});
			return false
		}
	}

}



