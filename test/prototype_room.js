module.exports = function () {
	_.assign(Room.prototype, roomExtension);
}


const roomExtension = {
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
		let creepsNum = _.filter(Game.creeps, (creep) =>
			creep.memory.role == role && creep.memory.targetId == targetId && creep.memory.spawnName == spawnName
			&& creep.memory.targetRoomName == targetRoomName && creep.memory.selfId == selfId && creep.memory.selfRoomName == selfRoomName);
		if (creepsNum < limitNum) {
			var name = role + Game.time
			var res = Game.spawns[spawnName].spawnCreep(body, name, {
				memory:
					{
						role: role,
						selfId: selfId,
						selfRoomName: selfRoomName,
						targetId: targetId,
						targetRoomName: targetRoomName,
						spawnName: spawnName
					}
			})
			return false
		} else {
			return true
		}
	},
	/**
	 *
	 * @param role
	 * @param targetId
	 * @param targetRoomName
	 * @param spawnName
	 * @param body
	 */
	new_creep: function (role, selfId, selfRoomName, targetId, targetRoomName, spawnName, body) {
		var name = role + Game.time
		var res = Game.spawns[spawnName].spawnCreep(body, name, {
			memory:
				{
					role: role,
					selfId: selfId,
					selfRoomName: selfRoomName,
					targetId: targetId,
					targetRoomName: targetRoomName,
					spawnName: spawnName
				}
		})
	},
}







