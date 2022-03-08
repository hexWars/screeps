module.exports = function () {
	_.assign(Spawn.prototype, extension)
}


const extension = {
	/**
	 * 对队列进行检查
	 */
	work: function () {
		// 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
		if (this.spawning || !this.memory.spawnList || this.memory.spawnList.length == 0) return
		// 进行生成
		const spawnSuccess = this.mainSpawn(this.memory.spawnList[0])
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
		//todo 个方法将任务的名称追加到任务队列的末尾，然后返回它的排队位置
		// 任务加入队列
		this.memory.spawnList.push(taskName)
		return this.memory.spawnList.length
	},
	/**
	 * 生成creep
	 * @param taskName 任务名
	 * @return {boolean} 成功与否
	 */
	mainSpawn: function (taskName) {
		return false
	}

}



