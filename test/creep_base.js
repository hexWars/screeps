//todo 死亡前多久到容器中
//todo 中间碰到掉落捡起
//todo 只能有一个而且它这个死之前要有新的产生,即永久保持数量
//todo 删除内存
//todo 去哪里,干什么,然后去哪里,再干什么
// creep, roomName, [地点], [opts], toRoomName ,[地点], [opts]
//todo 一种想法:一条线里creep进行交接

//todo 采运分离(采资源,运资源)
//todo 修路(和其他建筑,可以),资源采运(矿物采运等),建造,升级

//todo 依旧先使用内存轮询的方案

// 把所有的取和拿放到俩函数中
let Creep_base = {
	//todo 专门1creep维护建筑
	//todo 优先级的确定
	//todo 如果单独的快死了就新增
	//todo 如果被攻击就攻击回去
	/**
	 *
	 * @param role
	 * @param targetId 目标id
	 * @param spawnId
	 * @param limitNum 限制数量
	 * @param body 部件
	 */
	creep_new: function (role, targetId, spawnId, limitNum, body) {
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum < limitNum) {
			var name = role + Game.time
			var res = Game.getObjectById(spawnId).spawnCreep(body, name, {
				memory:
					{role: role, targetId: targetId, spawnId: spawnId}
			})
			console.log("未达规定")
			return false
		} else {
			console.log(role + targetId + spawnId + "达到数量限制")
			return true
		}
	},
	/**
	 * 使用
	 * @param creep
	 * @param obj1 取出的对象
	 * @param obj2 使用的对象
	 * @param opts
	 */
	creep_use_en: function (creep, obj1, obj2, opts = {reusePath: 10, visualizePathStyle: {stroke: '#ffaa00'}}) {
		if (creep.store.getFreeCapacity() > 0) {// 有余量
			if (creep.withdraw(obj1, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj1, opts);
			}
		} else {
			if (creep.transfer(obj2, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj2, opts);
			}
		}
	},
	/**
	 * 采集
	 * @param creep
	 * @param obj1 资源对象
	 * @param obj2 存储对象
	 * @param opts
	 */
	creep_harvest_en: function (creep, obj1, obj2, opts = {reusePath: 10, visualizePathStyle: {stroke: '#ffaa00'}}) {
		if (creep.store.getFreeCapacity() > 0) {// 有余量
			if (creep.harvest(obj1) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj1, opts)
			}
		} else {
			if (creep.transfer(obj2, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj2, opts);
			}
		}
	},
	/**
	 * 递归
	 * arr_type允许 container,controller
	 * 从creep传给建筑
	 */
	dfs_transfer_structure: function (creep, arr_type, x, len) {
		if (x == len) {
			return
		}
		if (arr_type[x] === STRUCTURE_CONTROLLER) {
			var sources = creep.room.controller;
			if (sources) {
				if (creep.upgradeController(sources) === ERR_NOT_IN_RANGE) {
					creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				this.dfs_transfer_structure(creep, arr_type, x + 1, len)
			}
		} else if (arr_type[x] === STRUCTURE_RAMPART) {
			var sources = creep.room.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return obj.structureType === STRUCTURE_RAMPART && obj.hits < 1000;
				}
			})
			if (sources.length > 0) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
				creep.repair(sources[0]);
			} else {
				this.dfs_transfer_structure(creep, arr_type, x + 1, len)
			}
		} else if (arr_type[x] === STRUCTURE_WALL) {
			var sources = creep.room.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return obj.structureType === STRUCTURE_WALL && obj.hits < 1000;
				}
			})
			if (sources.length > 0) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
				creep.repair(sources[0]);
			} else {
				this.dfs_transfer_structure(creep, arr_type, x + 1, len)
			}
		} else {
			var sources = creep.room.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return obj.structureType === arr_type[x];
				}
			})
			if (sources.length > 0) {
				if (creep.transfer(sources[0]) === ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				this.dfs_transfer_structure(creep, arr_type, x + 1, len)
			}
		}
	},
	/**
	 * 从建筑中取出
	 *
	 */
	dfs_withdraw_structure: function (creep, arr_type, x, len) {
		if (x == len) {
			return
		}
		var sources = creep.room.find(FIND_MY_STRUCTURES, {
			filter: function (obj) {
				return obj.structureType === arr_type[x];
			}
		})
		if (sources.length > 0) {
			if (creep.upgradeController(sources[0]) === ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			this.dfs_withdraw_structure(creep, arr_type, x + 1, len)
		}
	},
	/**
	 * 如果小于200就新增,包括优先级问题
	 */
	creep_keep_num: function () {

	},
	/**
	 * 如果被攻击就攻击回去
	 */
	attack_to_attack: function (creep) {

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
		for (i = 0; i < work; i++) {
			body.push(WOEK)
		}
		for (i = 0; i < move; i++) {
			body.push(MOVE)
		}
		for (i = 0; i < carry; i++) {
			body.push(CARRY)
		}
		for (i = 0; i < attack; i++) {
			body.push(ATTACK)
		}
		for (i = 0; i < ranged_attack; i++) {
			body.push(RANGED_ATTACK)
		}
		for (i = 0; i < heal; i++) {
			body.push(HEAL)
		}
		for (i = 0; i < claim; i++) {
			body.push(CLAIM)
		}
		for (i = 0; i < tough; i++) {
			body.push(TOUGH)
		}
		console.log(body)
		return body
	},
	/**
	 * @param creep
	 * @param roomName
	 * @param opts 选项
	 *
	 * 移动到指定房间
	 * opts默认为 {visualizePathStyle: {stroke: '#ffaa00'}}
	 * 到房间返回true,未到返回false
	 */
	creep_to_room: function (creep, roomName, opts = {visualizePathStyle: {stroke: '#ffaa00'}}) {
		if (creep.room == Game.rooms[roomName]) {
			return true
		} else {
			const exitDir = creep.room.findExitTo(roomName);// 找到通往另一个房间的出口方向
			const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
			creep.moveTo(exit, opts);
			return false
		}

	},
	/**
	 * @param creep
	 * 开始输出creep信息
	 */
	start_msg: function (creep) {

	},
	/**
	 * @param creep
	 * 结尾输出creep信息
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
