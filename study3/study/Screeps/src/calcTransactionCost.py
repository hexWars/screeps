import math

# 挂单
# Game.market.createOrder({type: ORDER_SELL, resourceType: RESOURCE_ENERGY, price: 100000, totalAmount: 1, roomName: "W1N1"});
# Game.market.createOrder({type: ORDER_BUY, resourceType: PIXEL, price: 0.001, totalAmount: 500});
# Game.market.deal('61ed21c494728f76472c73a4', 3000);

def main():
    distance = 35
    price = 0.73

    amount = 100000

    cost = math.ceil(amount * (1 - pow(math.e, (-1*(distance)/30))))

    print('#######卖')
    print('距离：', distance)
    print('运费：', cost)
    print('出价：', price)
    print('减去运输费之后:')
    print('实价：', (price*amount)/(cost + amount))
    print('差价：', price - (price*amount)/(cost + amount))
    print('占比：', (price - (price*amount)/(cost + amount))/price)

    print('#######买')
    print('距离：', distance)
    print('运费：', cost)
    print('出价：', price)
    print('减去运输费之后:')
    print('实价：', ((price*amount)/(amount-cost)))

if __name__ == "__main__":
    main()

# python src/calcTransactionCost.py

# first order


# Game.market.deal('61dadb9a4215333d795d92d3', 1, 'W47S14');
# Game.rooms['W47S14'].terminal.send(RESOURCE_ENERGY, 20000, 'W41S11', 'free')

# 卖的实际价格
# 3.374/(1+(Game.market.calcTransactionCost(10000, 'W41S11', 'W33S21')/10000))

# 买的实际价格
# 3.374/(1-(Game.market.calcTransactionCost(10000, 'W41S11', 'W33S21')/10000))
