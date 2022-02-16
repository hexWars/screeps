var creepsBirth = {

	/**  *
	 * @param roleName 存到内存中的role名
	 * @param limitNum 限制数量
	 * @param partTypes 携带部件
	 */
	run: function (roleName, limitNum, partTypes) {
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < limitNum) {// 没有到规定数量
			var newName = roleName + Game.time;
			if (Game.spawns['Spawn1'].spawnCreep(partTypes, newName, {memory: {role: roleName}}) == 0) {
				return true;// 创建成功
			} else {
				return false;// 创建失败
			}
		}
		return true;// 到了规定数量
	}
};

module.exports = creepsBirth;
