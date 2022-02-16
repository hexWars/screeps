var creepBirth = require('creep-birth')

var initCreeps = {

	/** @param {Creep} Cai **/
	run: function () {
		let arr = []
		let flag = true
		//------------------------------------------------------------todo 优先级最高
		arr.push(creepBirth.run("builder", 1, [WORK, CARRY, MOVE, WORK]))
		//------------------------------------------------------------削弱版
		arr.push(creepBirth.run("harvesterE54N12toE54N12", 1, [WORK, CARRY, MOVE, WORK]))
		//------------------------------------------------------------增强版
		creepBirth.run("harvesterE54N12toE54N12", 0, [WORK, CARRY, MOVE, WORK, WORK]);
		//------------------------------------------------------------纯收割
		creepBirth.run("harvester-E54N12-x47-y38", 0, [WORK, MOVE, WORK, WORK]);
		//------------------------------------------------------------纯搬运
		creepBirth.run("harvester-E54N12-x47-y38", 0, [WORK, MOVE, WORK, WORK]);
		//------------------------------------------------------------
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == false) {
				flag = false; break;
			}
		}
		//------------------------------------------------------------todo 优先级第二
		if (flag) {
			//------------------------------------------------------------
			creepBirth.run("harvesterE54N11toE54N12", 0, [WORK, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N12toE54N12", 0, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N11toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N11toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE53N13toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
			creepBirth.run("upgraderE54N13toE54N12", 5, [WORK, CARRY, MOVE, CARRY, MOVE]);
			//------------------------------------------------------------
		}


	}
};

module.exports = initCreeps;
