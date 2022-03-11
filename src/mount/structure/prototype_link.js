import {config} from "../../config";

export const p_spawn = function () {
	_.assign(StructureLink.prototype, linkExtension)
}

const linkExtension = {
	//todo 三个link
	// 源link传能量,中央link接受能量,防御link接收
	// 中央LinkId存到json中
	// 先完成源到中心

	work: function () {
		let linkConfig = config[roomName].structures.Link
		let centerLink = Game.getObjectById(linkConfig.center)
		let fromMap = []
		for (let i=0; i<linkConfig.from.length; i++) {
			fromMap[linkConfig.from[i]]++
		}
		let toMap = []
		for (let i=0; i<linkConfig.to.length; i++) {
			toMap[linkConfig.to[i]]++
		}


		if (fromMap[this.id] > 0) {
			this.transferEnergy(centerLink);
		}
		//todo 战争状态,传送给其他link的没写


	},
}



