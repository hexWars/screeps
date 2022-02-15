var roleMoverpower ={
    /** @param {Creep} creep **/
    run: function(creep) {
        var amount
        var storage=creep.room.storage
        var terminal=creep.room.terminal
        var factory=creep.room.factory
        var powerspawn=creep.room.powerSpawn
        if(storage.store[RESOURCE_ENERGY]>300000&&powerspawn.store[RESOURCE_POWER]==0){
            if(terminal.store[RESOURCE_POWER]>0)WAT(creep,terminal,powerspawn,RESOURCE_POWER,100)
            if(storage.store[RESOURCE_POWER]>0)WAT(creep,storage,powerspawn,RESOURCE_POWER,100)
        }else if(factory&&terminal){
            for(var type in terminal.store){
                if(factory.store[type]<materialLimited(type)){
                    amount=Math.min(100, materialLimited(type)-factory.store[type]);
                    WAT(creep,terminal,factory,type,amount)
                    return;
                }
            }
            for(var type in factory.store){
                if(factory.store[type]>(materialLimited(type)+1)){
                    amount=Math.min(100, factory.store[type]-materialLimited(type));
                    WAT(creep,factory,terminal,type,amount)
                    return;
                }
            }
            if(creep.store.getUsedCapacity() > 0){
                creep.transfer(terminal,Object.keys(creep.store)[0])
                return
            }
            
        }
    }    
}
module.exports = roleMoverpower;

function WAT(creep,withdrawTarget,transferTarget,type,amount){   
    if(creep&&creep.store.getUsedCapacity() == 0){
        if(creep.withdraw(withdrawTarget,type,amount)== ERR_NOT_IN_RANGE){
            creep.moveTo(withdrawTarget);
        }
    }else if(creep){
        if(creep.transfer(transferTarget,Object.keys(creep.store)[0])==ERR_NOT_IN_RANGE){
            creep.moveTo(transferTarget)
        }
    }
}
function materialLimited(type){
    if(['silicon', 'metal','biomass','mist'].indexOf(type) != -1)return 200;
    if(!COMMODITIES[type])return -1;
    var min_amount = 600; 
    if(COMMODITIES[type]){
        if(COMMODITIES[type].level == 1)min_amount = 50;
        if(COMMODITIES[type].level == 2)min_amount = 10;
        if(COMMODITIES[type].level == 3)min_amount = 5;
        if(COMMODITIES[type].level == 4)min_amount = 2;
    }
    if(['composite','crystal','liquid'].indexOf(type) != -1)min_amount = 200;
    if(['wire','condensate','alloy','cell'].indexOf(type) != -1)min_amount = 200;
    if(type == 'energy')min_amount = 1000
    return min_amount;
}
