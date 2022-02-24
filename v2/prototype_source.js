

module.exports = function () {
	_.assign(Source.prototype, sourceExtension);

	/**
	 * 对source增加memory变量
	 */
	// Object.defineProperty(Source.prototype, 'memory', {
	// 	configurable: true,
	// 	get: function() {
	// 		if(_.isUndefined(Memory.mySourcesMemory)) {
	// 			Memory.mySourcesMemory = {};
	// 		}
	// 		if(!_.isObject(Memory.mySourcesMemory)) {
	// 			return undefined;
	// 		}
	// 		return Memory.mySourcesMemory[this.id] =
	// 			Memory.mySourcesMemory[this.id] || {};
	// 	},
	// 	set: function(value) {
	// 		if(_.isUndefined(Memory.mySourcesMemory)) {
	// 			Memory.mySourcesMemory = {};
	// 		}
	// 		if(!_.isObject(Memory.mySourcesMemory)) {
	// 			throw new Error('Could not set source memory');
	// 		}
	// 		Memory.mySourcesMemory[this.id] = value;
	// 	}
	// });

	/**
	 * 查看该资源资源有多少非墙位置
	 */
	// Object.defineProperty(Source.prototype, 'freeSpaceCount', {
	// 	get: function () {
	// 		if (this._freeSpaceCount == undefined) {
	// 			if (this.memory.freeSpaceCount == undefined) {
	// 				let freeSpaceCount = 0;
	// 				[this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
	// 					[this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
	// 						if (Game.map.getTerrainAt(x, y, this.pos.roomName) != 'wall')
	// 							freeSpaceCount++;
	// 					}, this);
	// 				}, this);
	// 				this.memory.freeSpaceCount = freeSpaceCount;
	// 			}
	// 			this._freeSpaceCount = this.memory.freeSpaceCount;
	// 		}
	// 		return this._freeSpaceCount;
	// 	},
	// 	enumerable: false,
	// 	configurable: true
	// });


}


const sourceExtension = {

}











