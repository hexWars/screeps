//todo 死亡前多久到容器中
//todo 中间碰到掉落捡起
//todo 只能有一个而且它这个死之前要有新的产生,即永久保持数量
//todo 删除内存
//todo 去哪里,干什么,然后去哪里,再干什么
// roomName,[], toRoomName,[]
//todo 一种想法:一条线里creep进行交接
let Creep_base = {

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
	 * @param creep
	 * @param roomName
	 * @param opts 选项
	 * 移动到指定房间
	 * opts默认为 {visualizePathStyle: {stroke: '#ffaa00'}}
	 */
	creep_to_room: function (creep, roomName, opts = {visualizePathStyle: {stroke: '#ffaa00'}}) {
		const exitDir = creep.room.findExitTo(roomName);// 找到通往另一个房间的出口方向
		const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
		creep.moveTo(exit, opts);
	},
	/**
	 * @param creep
	 * 开始输出信息
	 */
	start_msg: function (creep) {

	},
	/**
	 * @param creep
	 * 结尾输出信息
	 */
	end_msg: function (creep) {

	},
	/**
	 * 函数: renewCreep(target)
	 * 每次增加: floor(600/body_size)
	 * 所需能量: ceil(creep_cost/2.5/body_size)
	 * 经过计算废弃此函数
	 */
	die_renew: function () {

	}
}

module.exports = Creep_base;
