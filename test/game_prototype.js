
/**
 * 重复兵种
 * 重复功能模块
 */

let prototype = {

	/**
	 * 输出全局基本信息并生成pixel
	 */
	basic_glabal_msg: function () {
		console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
		if (Game.cpu.bucket === 10000) {
			Game.cpu.generatePixel();
		}
	},
	gc_name: function () {
		for (let name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];// 清除内存
			}
		}
	}

};

module.exports = prototype;
