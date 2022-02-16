var creepBirth = require('creep-birth')
var comCreepBirth = require('com-creep-birth')

var initCreeps = {

	/** @param {Creep} Cai **/
	run: function () {
		let arr = []
		let flag = true
		//------------------------------------------------------------todo 优先级最高
		// arr.push(creepBirth.run("builder", 0, [WORK, CARRY, MOVE, WORK]))
		//------------------------------------------------------------削弱版(临时)
		arr.push(creepBirth.run("harvesterE54N11toE54N12", 3, [WORK, CARRY, CARRY, MOVE, MOVE]))
		arr.push(creepBirth.run("harvesterE54N12toE54N12", 1, [WORK, WORK, CARRY, MOVE]))
		// ------------------------------------------------------------纯收割

		//------------------------------------------------------------纯搬运
		//------------------------------------------------------------xxxxxxxxxxxxxxxxxxxxxxx
		//todo 挖运分离
		arr.push(comCreepBirth.run("com_builder_E54N12_E54N12", 2, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]))
		arr.push(comCreepBirth.run("com_harvester_E54N12_E54N12", 1, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE]))

		arr.push(creepBirth.run("com_E54N12_energy", 1, [WORK, MOVE, WORK, WORK, WORK, WORK, CARRY]))

		//------------------------------------------------------------

		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == false) {
				flag = false;
			}
		}
		console.log("第一优先级" + flag)
		//------------------------------------------------------------todo 优先级第二
		if (flag) {//如果flag是true,上面准备生产的会被覆盖
			console.log("第二优先级进行中")
			//------------------------------------------------------------
			creepBirth.run("harvesterE54N11toE54N12", 0, [WORK, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N12toE54N12", 0, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			//todo 重要的放下面,不重要的放上面,因为会覆盖
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N11toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N11toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N13toE54N12", 3, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N13toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE55N11toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------

		}


	}
};

module.exports = initCreeps;
