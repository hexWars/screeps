var creepBirth = require('creep-birth')

var initCreeps = {

	/** @param {Creep} Cai **/
	run: function () {
		let arr = []
		let flag = true
		//------------------------------------------------------------todo 优先级最高
		arr.push(creepBirth.run("builder", 0, [WORK, CARRY, MOVE, WORK]))
		//------------------------------------------------------------削弱版
		arr.push(creepBirth.run("harvesterE54N12toE54N12", 0, [WORK, CARRY, MOVE, WORK]))
		// ------------------------------------------------------------纯收割
		creepBirth.run("com_harvester_E54N12_47_38", 1, [WORK, MOVE, WORK, WORK, WORK, CARRY]);
		// //------------------------------------------------------------纯搬运
		// creepBirth.run("harvester_E54N12_x47_y38", 0, [WORK, MOVE, WORK, WORK]);
		//------------------------------------------------------------xxxxxxxxxxxxxxxxxxxxxxx
		//todo 挖运分离
		let roleName = "com_builder_E54N12_E54N12";
		let limitNum = 1;
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < limitNum) {// 没有到规定数量
			var newName = roleName + Game.time;
			let ex = Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, WORK], newName, {memory: {role: roleName, pick: true}})
		}
		roleName = "com_harvester_E54N12_E54N12";
		limitNum = 1;
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < limitNum) {
			var newName = roleName + Game.time;
			let ex = Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, WORK], newName, {memory: {role: roleName, pick: true}})
		}
		//------------------------------------------------------------

		for (let i = 0; i < arr.length; i++) {
			// console.log(arr[i])
			if (arr[i] == false) {
				flag = false;
			}
		}
		console.log("第一优先级" + flag)
		//------------------------------------------------------------todo 优先级第二
		if (true) {//如果flag是true,上面准备生产的会被覆盖
			console.log("第二优先级进行中")
			//------------------------------------------------------------
			creepBirth.run("harvesterE54N11toE54N12", 0, [WORK, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N12toE54N12", 0, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			//todo 重要的放下面,不重要的放上面,因为会覆盖
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N11toE54N12", 4, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N11toE54N12", 4, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N13toE54N12", 4, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N13toE54N12", 4, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------

		}


	}
};

module.exports = initCreeps;
