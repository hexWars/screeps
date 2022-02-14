/**
 *  价格计算模块：
 *  这里只提供这个方法：
 *  StrategyMarketPrice.getSellPrice()
 *  返回一个map key是资源 value是售价 单位cr
 *
 *  StrategyMarketPrice.updateSellPrice(true)
 */

 Array.prototype.contains= function (another){return _.includes(this,another)};
 Array.prototype.head= function(){return _.head(this)};
 Array.prototype.sum= function(...e){return _.sum(this,...e)};
 Array.prototype.toMap= function(){return this.reduce((map,entry)=>{map[entry[0]] = entry[1];return map},{})};

 let COMPRESSION_SET = new Set([RESOURCE_UTRIUM_BAR,RESOURCE_LEMERGIUM_BAR,RESOURCE_KEANIUM_BAR,RESOURCE_ZYNTHIUM_BAR,RESOURCE_GHODIUM_MELT,RESOURCE_OXIDANT,RESOURCE_REDUCTANT,RESOURCE_PURIFIER,RESOURCE_BATTERY]);
 let BASE_RESTYPE = new Set([RESOURCE_ENERGY,"U","L","K","Z","X","O","H","ops"])
 let BLUE = [RESOURCE_DEVICE,RESOURCE_CIRCUIT,RESOURCE_MICROCHIP,RESOURCE_TRANSISTOR,RESOURCE_SWITCH,RESOURCE_WIRE];
 let YELLOW = [RESOURCE_MACHINE,RESOURCE_HYDRAULICS,RESOURCE_FRAME,RESOURCE_FIXTURES,RESOURCE_TUBE,RESOURCE_ALLOY];
 let PINK = [RESOURCE_ESSENCE,RESOURCE_EMANATION,RESOURCE_SPIRIT,RESOURCE_EXTRACT,RESOURCE_CONCENTRATE,RESOURCE_CONDENSATE];
 let GREEN = [RESOURCE_ORGANISM,RESOURCE_ORGANOID,RESOURCE_MUSCLE,RESOURCE_TISSUE,RESOURCE_PHLEGM,RESOURCE_CELL];
 let BASE_DEPOSITS = [RESOURCE_SILICON,RESOURCE_BIOMASS,RESOURCE_METAL,RESOURCE_MIST]; // 0 级
 let L1_DEPOSITS = [RESOURCE_WIRE,RESOURCE_ALLOY,RESOURCE_CONDENSATE,RESOURCE_CELL]; // 1 级
 let DEPO_MAP = (function (){
     let mp = {};
     BLUE.forEach(e=>mp[e] = RESOURCE_SILICON);
     YELLOW.forEach(e=>mp[e] = RESOURCE_METAL);
     PINK.forEach(e=>mp[e] = RESOURCE_MIST);
     GREEN.forEach(e=>mp[e] = RESOURCE_BIOMASS);
     return mp;
 })();
 
 let PRICE_TOLERANCE = 0.1 // 贱卖的价格 比例
 let TARGET_STORE_CNT = 100000 // 目标不讲价的卖的价格 的存储数量 超过这个值开始贱卖 目标 0.1m
 let DEPO_SET = new Set(BLUE.concat(YELLOW).concat(PINK).concat(GREEN))
 // 挖一个的成本大概在3.8 - 5 左右 取决于boost没有 s2 和 s3， 能量价格也不一样，挖到多少不挖也不一样，见仁见智吧
 // 挖到100 大概成本是3.8-7左右
 let DEFAULT_DEPO_PRICE =  5// 默认成本价格 ，这个不会从市场算了，市场买的价格虚高
 let DEFAULT_PRICE = // 默认资源价格//如果不能从市场算的话//所有资源都会从这边算//如果低于这个价格按这个价格算
     (function () {
         if(Game.shard.name=="shard3")
             return  {"energy":0.5, "U":1.5, "L":0.5, "K":0.7, "Z":0.3, "X":4, "O":0.5, "H":1.1,"ops":1,}
         if(Game.shard.name=="Screeps.Cc")
             return  {"energy":1, "U":0.3, "L":0.3, "K":0.3, "Z":0.3, "X":0.95, "O":0.1, "H":0.1,"ops":1,}
         else
             return {"energy":1.5, "U":1.8, "L":1, "K":1, "Z":1, "X":8, "O":1.8, "H":1,}
 })();
 
 let MAX_DELAY = 86400/16 ; // 更新商品价格的延迟  大概6小时跟新一次
 
 
 let pro = {
     _lastTick : -1e9, //上次更新时间
     // _baseResPrice:{},// 基础资源价格
     _depoResPrice:{},// 商品交易价格
     _depoResPriceStddev:{},// 商品交易方差
     // _avgBaseDepoProfit:{},// 平均每个基础商品的交易利润
 
     // 计算合成需要的资源，计算利润
     _depoNeedPerCommodity : {},// 商品合成需要多少 单位基础商品
     _depoCostPerCommodity : {},// 商品合成需要多少cr 单位在每个基础商品上需要花多少额外资源的价格
 
     _depoSellPrice :{},// final sell price
 
     getSellPrice (){
         pro.updatePrice();
        //  Memory.rooms['W47S14'].sellprice = pro._depoSellPrice;
         return pro._depoSellPrice;
     },
 
     updatePrice (){
         if(pro._lastTick>=Game.time)return;
         // let time = Game.cpu.getUsed();
         pro.updateDepoPrice();
         pro.updateDepoHistroyPrice();
         pro.updateSellPrice()
         pro._lastTick=Game.time+MAX_DELAY;
         // log(Game.cpu.getUsed() - time) // 更新一次 大概消耗 2cpu
     },
 
     updateSellPrice (show) {
         let profitMap = {} // 利润
         pro._depoSellPrice = {};
         if(show)console.log("基础价格:","商品","均价","最低售价","利润","售价比")
 
         let myRooms = _.values(Game.rooms).filter(e=>e.my)
 
         let depoRatioMap = L1_DEPOSITS.map(e=>[DEPO_MAP[e],myRooms.map(room=>StationCarry.roomMassStoreCnt(room,e)).sum()/TARGET_STORE_CNT]).toMap()
 
         for(let k in DEPO_MAP){
             let storeRatio = Math.sqrt(depoRatioMap[DEPO_MAP[k]])-1; //sqrt(x)
             let minSellPrice = pro._depoResPrice[k]*(1-PRICE_TOLERANCE*storeRatio); // 最少需要的价格
             let profit = minSellPrice/pro._depoNeedPerCommodity[k] - pro._depoCostPerCommodity[k];
             if(show)console.log(k,pro._depoResPrice[k],minSellPrice,profit,1-PRICE_TOLERANCE*storeRatio)
             profitMap[k] = profit;
             if(profit>DEFAULT_DEPO_PRICE*1.5)pro._depoSellPrice[k] = minSellPrice;// 必须有的赚才卖
         }
 
 
         if(show)console.log("修正价格:","商品","售价","均价差距比","利润");
         [BLUE,YELLOW,PINK,GREEN].forEach(series=>{ // 按利润线均匀出售
             let maxProfit = 0;
             series.forEach(e=>{if(maxProfit < profitMap[e])maxProfit = profitMap[e]})
             series.forEach(e=>{if(maxProfit > profitMap[e]){
                 let oldPrice = pro._depoSellPrice[e];
                 pro._depoSellPrice[e] = (maxProfit+pro._depoCostPerCommodity[e])*pro._depoNeedPerCommodity[e] // 修正后的价格
                 if(show)console.log(e,pro._depoSellPrice[e],pro._depoSellPrice[e]/(pro._depoResPrice[e]||1),maxProfit);
             }else {
                 if(show)console.log(e,pro._depoSellPrice[e],pro._depoSellPrice[e]/(pro._depoResPrice[e]||1),maxProfit);
             }})
             // series.forEach(e=> delete pro._depoSellPrice[e])
         })
 
     },
 
     getHistory(resType) {
         return Game.market.getHistory(resType)||[];//historys //
     },
 
     updateDepoHistroyPrice (){
         let historyOrders =  pro.getHistory();
 
         let amount = {}
         let priceSum = {}
         let stddevDays = {}
         let stddev = {}
         historyOrders.forEach(e=>{
             if(!DEPO_SET.has(e.resourceType))return;
             priceSum[e.resourceType] = ( priceSum[e.resourceType] || 0 ) + e.avgPrice*e.volume;
             amount[e.resourceType] = ( amount[e.resourceType] || 0 ) + e.volume;
             stddevDays[e.resourceType] = (stddevDays[e.resourceType]||0)+1;
             stddev[e.resourceType] = (stddev[e.resourceType]||0)+e.stddevPrice;
         });
 
         let depoResPrice = {};
         let depoResPriceStddev = {};
         let sumBaseDepoProfit = {};
         let cntBaseDepoProfit = {};
         for(let resType in priceSum) {
             let BaseDepo = DEPO_MAP[resType];
 
             depoResPrice[resType] = priceSum[resType]/amount[resType] ;
             depoResPriceStddev[resType] = stddev[resType]/stddevDays[resType];
             sumBaseDepoProfit[BaseDepo] = (sumBaseDepoProfit[BaseDepo]||0) + priceSum[resType] - pro._depoCostPerCommodity[resType]* pro._depoNeedPerCommodity[resType]*amount[resType];
             cntBaseDepoProfit[BaseDepo] = (cntBaseDepoProfit[BaseDepo]||0) + amount[resType] * pro._depoNeedPerCommodity[resType];
         }
         // let avgBaseDepoProfit = {}
         // for(let resType in sumBaseDepoProfit) {
         //     avgBaseDepoProfit[resType] = sumBaseDepoProfit[resType]/cntBaseDepoProfit[resType]
         // }
         pro._depoResPrice = depoResPrice;
         pro._depoResPriceStddev = depoResPriceStddev;
         // pro._avgBaseDepoProfit = avgBaseDepoProfit;
         // log(depoResPrice);
         // log(depoResPriceStddev);
         // log(avgBaseDepoPrice);
 
     },
     getBaseResTypeHistory  (){ // 基础资源的价格
         let historyOrders =  pro.getHistory();
         let history = {}
         historyOrders.forEach(e=>{
             if(!BASE_RESTYPE.has(e.resourceType))return;
             if(e.stddevPrice>e.avgPrice&&e.stddevPrice>=1)return; // 排除有些人挂单换cr
             // if(e.date==date)return;// 排除当天交易
             if(!history[e.resourceType])
                 history[e.resourceType] = [];
             history[e.resourceType].push(e)
         })
         let out = {}
         for(let resType of BASE_RESTYPE){
             let hisArr = history[resType];
             if(hisArr){
                 let avg = _.sum(hisArr.map(e=>e.avgPrice))/hisArr.length
                 if(avg>DEFAULT_PRICE[resType])out[resType] = avg;
                 else out[resType] = DEFAULT_PRICE[resType];
             }else {
                 out[resType] = DEFAULT_PRICE[resType]
             }
         }
 
         // Object.entries(priceSum).sort((a,b)=>a[1]-b[1]).map(e=>[e[0],e[1],e[1]/amount[e[0]],amount[e[0]]]).forEach(e=>console.log(e));
         return out
     },
     getResTypeHistory  (resType){ // 资源平均价格价格
         let history = pro.getHistory(resType).filter(e=>!(e.stddevPrice>e.avgPrice&&e.stddevPrice>=1))// 排除有些人挂单换cr
         if(!history)return 0
         return _.sum(history.map(e => e.avgPrice)) / history.length // 平均值
     },
     updateDepoPrice (){ // 计算合成的成本
         let price = pro.getBaseResTypeHistory();
         let getPrice = function (resType){
             // let data = price.list.filter(e=>e._id==resType).head();
             let data = price[resType];
             if(resType == "G") return getPrice("L")+getPrice("U")+getPrice("O")+getPrice("K") // g默认用原矿
             if(BASE_DEPOSITS.contains(resType))return DEFAULT_DEPO_PRICE;
             return data
         };
         let getAllPrice = function (resMap){
             return _.sum(_.keys(resMap).map(e=>getPrice(e)*resMap[e]))
         }
         let getResCnt = function (resType,cnt,resMap){
             let amount = COMMODITIES[resType].amount
             for(let base in COMMODITIES[resType].components){
                 let t = COMMODITIES[resType].components[base]*cnt/amount
                 if(COMMODITIES[base]&&!COMPRESSION_SET.has(resType)){
                     getResCnt(base,t,resMap)
                 }else{
                     resMap[base]=(resMap[base]||0)+t
                     // log(base,t)
                 }
             }
             if(COMMODITIES[resType].level){
                 let base = "ops"
                 let batch = Math.ceil(1000/COMMODITIES[resType].cooldown)// 每1000 tick 能反应几次
                 let amount = COMMODITIES[resType].amount
                 resMap[base]=(resMap[base]||0)+(100/batch)/amount
             }
             return resMap
         };
         pro._depoNeedPerCommodity = {};
         pro._depoCostPerCommodity = {};
         [BLUE,YELLOW,PINK,GREEN].forEach(e=>{
             e.forEach(sellDepo=>{
                 let mp = {}// 单个资源需要多少
                 let basePrice = getAllPrice(getResCnt(sellDepo,1,mp)) // 基础价格
                 // let sellDepoPrice = getPrice(sellDepo)
                 let depo = _.keys(mp).filter(e=>BASE_DEPOSITS.contains(e)).head()
                 // let sellPrice = ((basePrice/mp[depo])+100)*mp[depo]
                 // (sellDepoPrice - basePrice)/mp[depo]
                 // let opsPerDepo = mp["ops"]/mp[depo]
                 // sellPrice
                 // opsPerDepo
 
                 // console.log(sellDepo,mp[depo],basePrice,basePrice/mp[depo])//,basePrice/sellDepoPrice
                 // log(mp)
                 pro._depoNeedPerCommodity[sellDepo] = mp[depo];
                 pro._depoCostPerCommodity[sellDepo] = basePrice/mp[depo];
             });
             // console.log()
         })
 
     }
 }
 
 pro.updatePrice();
 global.StrategyMarketPrice=pro;