import {market} from "./other/market";


export const cmd = {
	market_buy_min_cost: function (Type, roomName) {
		market.buy_min_cost(Type, roomName)
	},
	market_sell_max_cost: function (Type, roomName) {
		market.sell_max_cost(Type, roomName)
	}
}


