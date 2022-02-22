

module.exports = function () {
	_.assign(Room.prototype, roomExtension);


	Object.defineProperty(Room.prototype, 'sources', {
		get: function() {
			// 如果 room 对象内部没有保存该值
			if (!this._sources) {
				// 如果房间内存中没有保存该值
				if (!this.memory.sourceIds) {
					// 查找 source 并将它们的 id 保存到内存里，
					// **不要** 保存整个 source 对象
					this.memory.sourceIds = this.find(FIND_SOURCES)
						.map(source => source.id);
				}
				// 从内存中获取它们的 id 并找到对应的 source 对象，然后保存在 room 对象内部
				this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
			}
			// 返回内部保存的 source 对象
			return this._sources;
		},
		set: function(newValue) {
			// 当数据保存在内存中时，你会希望在修改 room 上的 source 时
			// 也会自动修改内存中保存的 id 数据
			this.memory.sourceIds = newValue.map(source => source.id);
			this._sources = newValue;
		},
		writable: true, // 是否可再次赋值
		enumerable: false,  // 是否可被 for-in 遍历
		configurable: false // 是否可被再次 define
	});

	Object.defineProperty(Room.prototype, 'structures', {
		get: function() {
			// 如果 room 对象内部没有保存该值
			if (!this._structures) {
				// 如果房间内存中没有保存该值
				if (!this.memory.structureIds) {
					// 查找 source 并将它们的 id 保存到内存里，
					// **不要** 保存整个 source 对象
					this.memory.structureIds = this.find(FIND_STRUCTURES)
						.map(structure => structure.id);
				}
				// 从内存中获取它们的 id 并找到对应的 source 对象，然后保存在 room 对象内部
				this._structures = this.memory.structureIds.map(id => Game.getObjectById(id));
			}
			// 返回内部保存的 source 对象
			return this._structures;
		},
		set: function(newValue) {
			// 当数据保存在内存中时，你会希望在修改 room 上的 source 时
			// 也会自动修改内存中保存的 id 数据
			this.memory.structureIds = newValue.map(structure => structure.id);
			this._structures = newValue;
		},
		writable: true, // 是否可再次赋值
		enumerable: false,  // 是否可被 for-in 遍历
		configurable: false // 是否可被再次 define
	});


}


const roomExtension = {

}







