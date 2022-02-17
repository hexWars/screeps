
/**
 * 重复兵种
 * 重复功能模块
 */

let prototype = {

	/**
	 * 输出全局基本信息
	 */
	basic_glabal_msg: function () {
		console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
	},
	/**
	 * @param work 50
	 * @param move 100
	 * @param carry 50
	 * @param attack 80
	 * @param ranged_attack 150
	 * @param heal 250
	 * @param claim 600
	 * @param tough 10
	 */
	creep_body: function (work, move, carry, attack, ranged_attack, heal, claim, tough) {
		let body = []
		let i
		for (i=0; i<work; i++) {body.push(WOEK)}
		for (i=0; i<move; i++) {body.push(MOVE)}
		for (i=0; i<carry; i++) {body.push(CARRY)}
		for (i=0; i<attack; i++) {body.push(ATTACK)}
		for (i=0; i<ranged_attack; i++) {body.push(RANGED_ATTACK)}
		for (i=0; i<heal; i++) {body.push(HEAL)}
		for (i=0; i<claim; i++) {body.push(CLAIM)}
		for (i=0; i<tough; i++) {body.push(TOUGH)}
		return body
	},
	/**
	 *
	 * 移动到固定房间
	 */
	creep_to_room: function () {

	},
	/**
	 *
	 * 移动到固定目标
	 */
	creep_to_target: function () {

	}
};

module.exports = prototype;
