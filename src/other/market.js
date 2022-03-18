//todo 指定数据,如果低于购买超过卖出
//todo 指定资源类型查看哪个买入最便宜
//todo 指定资源查看卖出哪个盈利最多

export const market = {
	/**
	 * 买入的最小花费
	 * @param Type
	 * @param selfRoomName
	 */
	buy_min_cost: function (Type, selfRoomName) {
		let sell = Game.market.getAllOrders({type: ORDER_SELL, resourceType: Type});
		let minC = 999999
		let id = "id错误"
		for (let x of sell) {
			if (minC > market.get_buy_cost(x.id, selfRoomName)) {
				minC = market.get_buy_cost(x.id, selfRoomName)
				id = x.id
			}
		}
		console.log("需要 " + minC + " Cr")
		console.log("id: " + id)
		return id
	},
	/**
	 * 返回买入所需的价格
	 * @param id
	 * @param roomName
	 * @return {number}
	 */
	get_buy_cost: function (id, roomName) {
		let obj = Game.market.getOrderById(id)
		let transfer_cost = Game.market.calcTransactionCost(1, roomName, obj.roomName)*2//乘以能量价格
		// console.log("id:" + id + " 花费:" + Game.market.calcTransactionCost(1000, roomName, obj.roomName))
		return obj.price + transfer_cost;
	}
}
