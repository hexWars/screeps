var creepsBirth = {

	/**  *
	 * @param roleName 存到内存中的role名
	 * @param limitNum 限制数量
	 * @param body 携带部件
	 */
	run: function (roleName, limitNum, body) {
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < limitNum) {// 没有到规定数量
			var newName = roleName + Game.time;
			let ex = Game.spawns['Spawn1'].spawnCreep(body, newName, {memory: {role: roleName}})
			// console.log(roleName + "创建成功" + ex)
			return false;
		}
		// console.log(roleName + "到了规定数量")
		return true;
	}
};

module.exports = creepsBirth;
