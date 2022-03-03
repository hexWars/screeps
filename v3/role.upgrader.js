/**
 * 升级者配置生成器
 * source: 从指定矿中挖矿
 * target: 将其转移到指定的 roomController 中
 *
 * @param sourceId 要挖的矿 id
 */
module.exports = sourceId => ({
	// 采集能量矿
	source: creep => {
		const source = Game.getObjectById(sourceId)
		if (creep.harvest(source) == ERR_NOT_IN_RANGE) creep.moveTo(source)

		// 自己身上的能量装满了，返回 true（切换至 target 阶段）
		return creep.store.getFreeCapacity() <= 0
	},
	// 升级控制器
	target: creep => {
		const controller = creep.room.controller
		if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) creep.moveTo(controller)

		// 自己身上的能量没有了，返回 true（切换至 source 阶段）
		return creep.store[RESOURCE_ENERGY] <= 0
	}
})
