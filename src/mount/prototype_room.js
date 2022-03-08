import {filter} from "lodash";

export const p_room = function () {
	_.assign(Room.prototype, extension);
}


const extension = {
	/**
	 * 资源缓存
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
	 * 所有extension和spawn
	 * @return {*}
	 */
	extensionsAndSpawn: function () {
		if (!this.memory._exten) {
			if (!this.memory.extenId) {
				this.memory.extenId = this.find(FIND_STRUCTURES, {
					filter: (obj) => (obj.structureType === STRUCTURE_CONTAINER || obj.structureType === STRUCTURE_SPAWN)
					&& obj.store.getFreeCapacity() > 0
				}).map(structure => structure.id);
			}
			this._exten = this.memory.extenId.map(id => Game.getObjectById(id));
		}
		return this._exten
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
	}

}







