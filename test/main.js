let prototype = require('test/game_prototype')
let creep_base = require('creep_base')
//todo 房间里所有塔有相同职责

module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------")

	config_power.run();
	config_spawn.run();
	creep_base.creep_to_room(a,b,c)

}
