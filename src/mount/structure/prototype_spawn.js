import {config} from "../../config";

export const p_spawn = function () {
	_.assign(Spawn.prototype, spawnExtension)
}


const spawnExtension = {
	/**
	 * 对队列进行检查
	 */
	work: function () {
		// 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
		if (this.spawning || !this.memory.spawnList || this.memory.spawnList.length == 0) return
		// 进行生成
		//todo 智能选择spawn的方法
		const spawnSuccess = this.mainSpawn("Spawn1", this.memory.spawnList[0])
		// 生成成功后移除任务
		if (spawnSuccess) this.memory.spawnList.shift()
		//fruits.reverse(); 可以实现倒序,即最后一个排到前面
	},
	/**
	 * 添加任务
	 * @param taskName 任务名
	 * @return {number} 返回任务队列长度
	 */
	addTask: function (taskName) {
		this.memory.spawnList.push(taskName)
		return this.memory.spawnList.length
	},
	/**
	 * 生成creep
	 * @param data 要生成的creep的内存信息
	 * @param spawnName 从哪个spawn生成
	 * @return {boolean} 成功与否
	 */
	mainSpawn: function (data, spawnName) {
		var name = role + Game.time
		let this_spawn = Game.spawns[spawnName]
		//todo body没有(通过json获取), 内存尽量少, 哪个spawn(其他方法,智能选择)
		let roomJson = config[this_spawn.room]
		let body = roomJson[data.role].body
		let res = Game.spawns[spawnName].spawnCreep(body, name, {data})
		return res === OK;
	}

}



