module.exports = {
    run:function(roomName){
        var terminal=Game.rooms[roomName].terminal; 
        if(terminal){
            for (let rooms in Game.rooms) {
                //补充化合原料
                if(Memory.lab[rooms]&&roomName!=rooms&&Game.rooms[rooms].terminal){
                    for(let type in terminal.store){
                        if(Memory.lab[rooms].ctrol&&type!=RESOURCE_ENERGY&&(type==RESOURCE_CATALYST||(ONERESOURCE[type]==1||tWORESOURCE[type]==1||YUANRESOURCE[type]==1))){
                            if(terminal.store[type]>10000&&Game.rooms[rooms].terminal.store[type]<10000&&Game.rooms[rooms].terminal.my){
                                var amout=10000-Game.rooms[rooms].terminal.store[type];
                                amout=Math.min(amout, terminal.store[type]);
                                amout=Math.min(amout, 2000);
                                terminal.send(type,amout,rooms);
                            } 
                        }
                        if(!Memory.lab[rooms].ctrol&&STREERESOURCE[type]&&Game.rooms[rooms].storage.store[type]<6000&&terminal.store[type]>=12000){
                            var amout=6000-Game.rooms[rooms].terminal.store[type];
                            amout=Math.min(amout, terminal.store[type]);
                            amout=Math.min(amout, 2000);
                            terminal.send(type,amout,rooms);
                        }
                    }
                }
            }   
            //发能量
            if(roomName!='W31N9'){
                if(Game.rooms['W31N9'].terminal.store.getFreeCapacity()>15000&&Game.rooms[roomName].storage&&Game.rooms[roomName].storage.store[RESOURCE_ENERGY]>100000){
                    terminal.send(RESOURCE_ENERGY,15000,'W31N9')
                }
            }
            //买power，卖wire
            if(terminal.room.name=='W31N9'){
                var orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER});
                orders.sort((a,b) => a.price-b.price);
                for(let i=0; i<orders.length; i++) {
                    if(orders[i].price<35){
                        var amount = Math.min(Math.floor(Game.market.credits/orders[i].price), orders[i].amount);
                        Game.market.deal(orders[i].id, amount,'W31N9');
                    }
                }
                orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_WIRE});
                orders.sort((a,b) => b.price-a.price);
                if(orders[0].price>540){
                    var amount = Math.min(terminal.store[RESOURCE_WIRE], orders[0].amount);
                    Game.market.deal(orders[0].id, amount,'W31N9');
                }

            }
            for(var type in terminal.store){  
                //卖出多余原矿 
                var maxhold=200000;
                if(YUANRESOURCE[type]==1){maxhold=12000;} 
                if(ONERESOURCE[type]==1||tWORESOURCE[type]==1){maxhold=10000;}
                if(terminal.store[type]>maxhold&&(YUANRESOURCE[type]==1||ONERESOURCE[type]==1||tWORESOURCE[type]==1)){
                    const  maxTransferEnergyCost = 6000;
                    const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: type});
                    const historyorders=Game.market.getHistory(type);
                    if(historyorders[historyorders.length-1]){
                        const avgprice=(historyorders[historyorders.length-1].avgPrice-historyorders[historyorders.length-1].stddevPrice);
                        orders.sort((a,b) => b.price-a.price);
                        for(let i=0; i<orders.length; i++) {
                            const transferEnergyCost = Game.market.calcTransactionCost(orders[i].amount, roomName , orders[i].roomName);
                            if(terminal.store[type]-orders[i].amount<maxhold){orders[i].amount=terminal.store[type]-maxhold;}
                            if(orders[i].price>0.2&&orders[i].price>=avgprice&&transferEnergyCost < maxTransferEnergyCost&&transferEnergyCost<terminal.store[RESOURCE_ENERGY]) {
                                Game.market.deal(orders[i].id, orders[i].amount, roomName);
                            }
                        }
                    }
                } 
                /**if(SELLRESOURCE[type]){
                    var haveorders=false;
                    for(const id in Game.market.orders) {
                        if(Game.market.orders[id].resourceType==type&&Game.market.orders[id].roomName==terminal.room.name){haveorders=true;}
                    }
                    if(!haveorders){
                        const historyorders=Game.market.getHistory(type);
                        if(historyorders.length>0){
                            const avgprice=(historyorders[historyorders.length-1].avgPrice+historyorders[historyorders.length-1].stddevPrice);
                            Game.market.createOrder({
                                type: ORDER_SELL,
                                resourceType: type,
                                price: 50,
                                totalAmount: terminal.store[type],
                                roomName: terminal.room.name   
                            });
                        }
                    }
                    for(const id in Game.market.orders) {
                        if(Game.market.orders[id].resourceType==type){
                            if(Game.market.orders[id].remainingAmount<terminal.store[type]){
                                Game.market.extendOrder(id, terminal.store[type]-Game.market.orders[id].remainingAmount);
                            }
                        }
                    }
                }*/
                //创建商品卖出订单,加单
                  
            }
        }

    }
}
const YUANRESOURCE={X:1,H:1,O:1,U:1,L:1,K:1,Z:1,G:1,ops:1}
const ONERESOURCE={OH: 1,ZK: 1,UL: 1,UH: 1,UO: 1,KH: 1,KO: 1,LH: 1,LO: 1,ZH: 1,ZO: 1,GH: 1,GO: 1}
const tWORESOURCE={UH2O: 1,UHO2: 1,KH2O: 1,KHO2: 1,LH2O: 1,LHO2: 1,ZH2O: 1,ZHO2: 1,GH2O: 1,GHO2: 1}
const STREERESOURCE={XUH2O: 1,XUHO2: 1,XKH2O: 1,XKHO2: 1,XLH2O: 1,XLHO2: 1,XZH2O: 1,XZHO2: 1,XGH2O: 1,XGHO2: 1}
const SELLRESOURCE={silicon:1}