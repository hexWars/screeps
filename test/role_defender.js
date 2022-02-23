const p_creep = require('prototype_creep')
const prototype = require("prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		var target = creep.checkEnemy();
		if (target) {
			if(creep.attack(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			creep.moveTo(30, 30, {visualizePathStyle: {stroke: '#ffaa00'}});
		}
	}
}

module.exports = role;
