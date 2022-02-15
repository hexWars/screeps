module.exports = {
    run:function(){
        Toproduce(RESOURCE_WIRE,'W31N9')        
    }        
}

function Toproduce(type,roomName){
    var room=Game.rooms[roomName]
    if(!Memory.factory)Memory.factory={}
    if(!Memory.factory[roomName])Memory.factory[roomName]={}
    if(room.factory.store[type]>=productLimited(type))return true
    for(var i in COMMODITIES[type].components){
        if(room.factory.store[i]>0)continue;
        type=i;
    }
    if(room.factory.cooldown == 0)room.factory.produce(type);
    return false;
}

function productLimited(type){
    var maxAmount = 5000;   
    if(['wire','condensate','alloy','cell'].indexOf(type) != -1)maxAmount = 2000;
    if(COMMODITIES[type]){
        if(COMMODITIES[type].level == 1)maxAmount = 1000;
        if(COMMODITIES[type].level == 2)maxAmount = 500;
        if(COMMODITIES[type].level == 3)maxAmount = 100;
        if(COMMODITIES[type].level == 4)maxAmount = 100;
    }
    return maxAmount
}

