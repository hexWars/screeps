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
	// dfs_transfer_structure: function (creep, arr_type, x, len) {
	// 	if (x == len) {
	// 		return
	// 	}
	// 	if (arr_type[x] === STRUCTURE_CONTROLLER) {
	// 		var sources = creep.room.controller;
	// 		if (sources) {
	// 			if (creep.upgradeController(sources) === ERR_NOT_IN_RANGE) {
	// 				creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
	// 			}
	// 		} else {
	// 			this.dfs_transfer_structure(creep, arr_type, x + 1, len)
	// 		}
	// 	} else if (arr_type[x] === STRUCTURE_RAMPART) {
	// 		var sources = creep.room.find(FIND_MY_STRUCTURES, {
	// 			filter: function (obj) {
	// 				return obj.structureType === STRUCTURE_RAMPART && obj.hits < 1000;
	// 			}
	// 		})
	// 		if (sources.length > 0) {
	// 			creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
	// 			creep.repair(sources[0]);
	// 		} else {
	// 			this.dfs_transfer_structure(creep, arr_type, x + 1, len)
	// 		}
	// 	} else if (arr_type[x] === STRUCTURE_WALL) {
	// 		var sources = creep.room.find(FIND_MY_STRUCTURES, {
	// 			filter: function (obj) {
	// 				return obj.structureType === STRUCTURE_WALL && obj.hits < 1000;
	// 			}
	// 		})
	// 		if (sources.length > 0) {
	// 			creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
	// 			creep.repair(sources[0]);
	// 		} else {
	// 			this.dfs_transfer_structure(creep, arr_type, x + 1, len)
	// 		}
	// 	} else {
	// 		var sources = creep.room.find(FIND_MY_STRUCTURES, {
	// 			filter: function (obj) {
	// 				return obj.structureType === arr_type[x];
	// 			}
	// 		})
	// 		if (sources.length > 0) {
	// 			if (creep.transfer(sources[0]) === ERR_NOT_IN_RANGE) {
	// 				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
	// 			}
	// 		} else {
	// 			this.dfs_transfer_structure(creep, arr_type, x + 1, len)
	// 		}
	// 	}
	// },
	/**
	 * 从建筑中取出
	 *
	 */
	// dfs_withdraw_structure: function (creep, arr_type, x, len) {
	// 	if (x == len) {
	// 		return
	// 	}
	// 	var sources = creep.room.find(FIND_MY_STRUCTURES, {
	// 		filter: function (obj) {
	// 			return obj.structureType === arr_type[x];
	// 		}
	// 	})
	// 	if (sources.length > 0) {
	// 		if (creep.upgradeController(sources[0]) === ERR_NOT_IN_RANGE) {
	// 			creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
	// 		}
	// 	} else {
	// 		this.dfs_withdraw_structure(creep, arr_type, x + 1, len)
	// 	}
	// },
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

	}
}

module.exports = Creep_base;
