
export const p_room = function () {
	_.assign(Room.prototype, roomExtension);
}


const roomExtension = {
	/**
	 * 内存重新载入
	 */
	init: function () {
		//todo source
		// 塔的位置
		// spawn和extension
		// link 等等所有建筑的位置

		//todo WALL的位置
	},
	/**
	 * 建筑点位置缓存
	 * @return {*}
	 */
	allConstructionSite: function () {
		if (!this._structuresSites) {
			this._structuresSites = this.find(FIND_CONSTRUCTION_SITES)
		}
		return this._structuresSites
	},
	/**
	 * 资源位置缓存
	 * @return {*}
	 */
	sources: function () {
		if (!this._sources) {
			if (!this.memory.sourceIds) {
				this.memory.sourceIds = this.find(FIND_SOURCES).map(source => source.id);
			}
			this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
		}
		return this._sources
	},
	/**
	 * 所有extension和spawn位置缓存
	 * @return {*}
	 */
	extensionsAndSpawn: function () {
		if (!this._extenAndSpawn) {
			this._extenAndSpawn = this.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN)
						&& obj.store.getFreeCapacity(RESOURCE_ENERGY) > 0
				}
			})
		}
		return this._extenAndSpawn
	},
	towers: function () {
		if (!this._towers) {
			this._towers = this.find(FIND_MY_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType === STRUCTURE_TOWER) &&
						structure.store[RESOURCE_ENERGY] < 1000;
				}
			});
		}
		return this._towers
	},
	/**
	 *
	 * @param limitNum
	 * @param role
	 * @param selfId
	 * @param selfRoomName
	 * @param targetId
	 * @param targetRoomName
	 * @param spawnName
	 * @param body
	 * @return {boolean}
	 */
	keep_creep_num: function (limitNum, role, selfId, selfRoomName, targetId, targetRoomName, spawnName, body) {
		let creeps = _.filter(Game.creeps, (creep) =>
			creep.memory.role == role
			&& creep.memory.targetId == targetId && creep.memory.targetRoomName == targetRoomName
			&& creep.memory.selfId == selfId && creep.memory.selfRoomName == selfRoomName);
		// console.log(role + " " + limitNum + " " + creeps.length + " || " + selfId + " " + selfRoomName + " " + targetId + " " + targetRoomName + " " + spawnName)
		if (creeps.length < limitNum) {
			var name = role + Game.time
			var res = Game.spawns[spawnName].spawnCreep(body, name, {
				memory:
					{
						role: role,
						selfId: selfId,
						selfRoomName: selfRoomName,
						targetId: targetId,
						targetRoomName: targetRoomName
						// hasSendRebirth: false
					}
			})
			return creeps.length
		} else {
			return creeps.length
		}
	},
	/**
	 * 发现敌人并缓存
	 * @return {*}
	 */
	checkEnemy: function () {
		if (!this._enemys) {
			this._enemys = this.find(FIND_HOSTILE_CREEPS)
		}
		return this._enemys
	}

}







