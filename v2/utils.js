let cost = {
	//todo 两个函数, 指定id和数目判断赚多少需要多少传送费
	// 判断所有的资源,并自动判断哪些可以赚并执行执行
	/**
	 * 返回买东西的总成本(单价加上传送消耗)
	 * @param sellId
	 * @return {number}
	 */
	getBuy: function (sellId) {
		let obj = Game.market.getOrderById(sellId)
		let transfer_cost = Game.market.calcTransactionCost(1, "E54N12", obj.roomName)
		return obj.price + transfer_cost;
	},
	/**
	 * 返回最小花费的id
	 * @param Type 资源类型
	 * @return {string}
	 */
	getLeastCost: function (Type) {
		let sell = Game.market.getAllOrders({type: ORDER_SELL, resourceType: Type});
		let minC = 666666
		let id = "000"
		for (let x of sell) {
			if (minC > cost.getBuy(x.id)) {
				minC = cost.getBuy(x.id)
				id = x.id
			}
		}
		console.log("需要" + minC)
		console.log("id位" + id)
		return id
	},
	/**
	 * 单个订单收益, 返回纯利润
	 * @param buyId
	 * @return {number}
	 */
	getCost: function (buyId) {
		let obj = Game.market.getOrderById(buyId)
		let transfer_cost = Game.market.calcTransactionCost(1, "E54N12", obj.roomName)
		return obj.price - transfer_cost;
	},
	/**
	 *
	 * @param Type 资源类型
	 * @return {string} 返回订单id
	 */
	getAllCost: function (Type) {
		let buy = Game.market.getAllOrders({type: ORDER_BUY, resourceType: Type});
		let maxC = 0
		let id = "000"
		for (let x of buy) {
			if (maxC < cost.getCost(x.id)) {
				maxC = cost.getCost(x.id)
				id = x.id
			}
		}
		console.log("赚" + maxC)
		console.log("id位" + id)
		console.log("1000个传输费用" + Game.market.calcTransactionCost(1000, "E54N12", Game.market.getOrderById(id).roomName))
		return id
	},
	getHighProfit: function () {
		// todo 自动搜索利润最高,自动买卖
		ARR_RESOURCE = [
			RESOURCE_ENERGY,
			RESOURCE_POWER,
			RESOURCE_HYDROGEN,
			RESOURCE_OXYGEN,
			RESOURCE_UTRIUM,
			RESOURCE_LEMERGIUM,
			RESOURCE_KEANIUM,
			RESOURCE_ZYNTHIUM,
			RESOURCE_CATALYST,
			RESOURCE_GHODIUM
		]

	}
}

module.exports = cost;


// {
// 	id : "55c34a6b5be41a0a6e80c68b",
// 		created : 13131117,
// 	type : "sell",
// 	resourceType : "OH",
// 	roomName : "W1N1",
// 	amount : 15821,
// 	remainingAmount : 30000,
// 	price : 2.95
// }621b353f69fa228ce14018b5


