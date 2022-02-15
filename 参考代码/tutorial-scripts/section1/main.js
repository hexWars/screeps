var roleHarvester = require('参考代码/tutorial-scripts/section1/role.harvester');

module.exports.loop = function () {

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		roleHarvester.run(creep);
	}
}
