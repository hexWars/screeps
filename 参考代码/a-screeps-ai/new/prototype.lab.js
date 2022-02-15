const STATE_FILL = 0
const STATE_CLEAN =2

const body = [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE];
var labs,isum,jsum,ijsum,terminal,creep

var labproduce = function(roomName){
    var labs= inlabs(roomName);
    var boostlabs= outlabs(roomName);
    var materials=Memory.lab[roomName].materials;
    var state = Memory.lab[roomName].state;
    const creepName = 'laber'+roomName;
    creep = Game.creeps[creepName];
    if(!creep&&materials!=null){autoSpawnCreep(creepName,roomName);}
    if(!Memory.lab[roomName].state)state=Memory.lab[roomName].state=0;
    //reaction
    if(!Memory.lab[roomName].materials||Memory.lab[roomName].materials==null){materials = findMaterial(roomName);}
    if(materials!=null){
        isum=getAllType(materials[0],roomName);
        jsum=getAllType(materials[1],roomName);
        ijsum=getAllType(materials[2],roomName);
        for(var i = 2;i<labs.length;i++){
            if(labs[0] && labs[1] && labs[i]){
                labs[i].runReaction(labs[0],labs[1]);
            }
        }
        if(ijsum>=10000||isum<=10||jsum<=10){materials = findMaterial(roomName);} 
    }   
    //console.log(findMaterial()+'he'+materials);
    //change state
    if(creep){terminal=creep.room.terminal;}
    var onefill=false;
    for(var i = 2;i<labs.length;i++){
        if(labs[i].store[labs[i].mineralType]==3000||(materials&&labs[i].mineralType!=materials[2]&&labs[i].mineralType!=undefined)){
            onefill=true;
        }
    }
    var allclear = true;
    labs.forEach(lab => {
        if(lab.store[lab.mineralType]>0)allclear = false;
    });
    if(state==STATE_FILL){
        if((materials!=Memory.lab[roomName].materials)||(Memory.lab[roomName].materials==null)){
            state= STATE_CLEAN;
        } 
        if(onefill){state=STATE_CLEAN;}
    }
    if(state == STATE_CLEAN && allclear&&creep&&creep.store.getUsedCapacity()==0){state=STATE_FILL;}
    Memory.lab[roomName].materials=materials;
    Memory.lab[roomName].state = state;
    //run state
    if(state==STATE_FILL){
        if(creep&&materials&&(labs[0].store[materials[0]] <= 2700 || labs[1].store[materials[1]] <= 2700)){
            if(labs[0].store[materials[0]]-labs[1].store[materials[1]]>=0){
                WAT(creep,terminal,labs[1],materials[1]);
            }else{
                WAT(creep,terminal,labs[0],materials[0]);
            }
        }else if(boostlabs.length){
            var boosttype=[]
            for(var type of nboosttype){
                if(Game.rooms[roomName].storage.store[type]>0)boosttype.push(type)
            }
            for(var j=0;j<boosttype.length;j++){
                if(boostlabs[j]&&boostlabs[j].store[boosttype[j]]<=2700){filltype(creep,boostlabs[j],boosttype[j]);break;}
                if(boostlabs[j]&&boostlabs[j].store[RESOURCE_ENERGY]<=1700){WAT(creep,creep.room.storage,boostlabs[j],RESOURCE_ENERGY);break;}
            }
        }
    }
    if(state==STATE_CLEAN&&creep){
        labs.forEach(lab => {
            if(lab.store[lab.mineralType]>0||creep.store.getUsedCapacity()>0){
                WAT(creep,lab,terminal,lab.mineralType);
            }
        });
    }
};
exports.product = labproduce;
const nboosttype=["XLHO2","XUHO2","XKHO2","XGH2O","XUH2O",]
const MYREACTIONS= {
    X: {
        LHO2: "XLHO2",//+300% heal and rangedHeal 效率
        UHO2: "XUHO2",//+600% harvest 效率
        KHO2: "XKHO2",//+300% rangedAttack 和 rangedMassAttack 效率
        UH2O: "XUH2O",//+300% attack 效率
        GH2O: "XGH2O",//+100% upgradeController 效率但不增加其能量消耗
        ZHO2: "XZHO2",//+300% fatigue(疲劳值) 减低速度
        GHO2: "XGHO2",//70% 伤害减免
        LH2O: "XLH2O",//+100% repair 和 build 效率但不增加其能量消耗    
        ZH2O: "XZH2O",//+300% dismantle 效率
        
    },
    OH: {
        UH: "UH2O",
        LO: "LHO2",
        UO: "UHO2",
        KO: "KHO2",
        GH: "GH2O",
        GO: "GHO2",
        LH: "LH2O",
        KH: "KH2O",
        ZH: "ZH2O",
        ZO: "ZHO2"   
    },
    O: {
        H: "OH",
        L: "LO",
        U: "UO",
        K: "KO",
        Z: "ZO",
        G: "GO"
    },
    H: {
        L: "LH",
        K: "KH",
        U: "UH",
        Z: "ZH",
        G: "GH"
    },
    ZK: {
        UL: "G"
    },
    Z: {
        K: "ZK"
    },
    L: {
        U: "UL",
    }     
}
function inlabs(roomName){
    labs = new Array();
    for(var i=0;i<Memory.lab[roomName].length;i++){
        if(Memory.lab[roomName]['labs'][i].boost==1)labs.push(Game.getObjectById(Memory.lab[roomName]['labs'][i].id))  
    }
    return labs;
}
function outlabs(roomName){
    labs = new Array();
    for(var i=0;i<Memory.lab[roomName].length;i++){
        if(Memory.lab[roomName]['labs'][i].boost==2)labs.push(Game.getObjectById(Memory.lab[roomName]['labs'][i].id))  
    }
    return labs;
}
function filltype(creep,lab,type){
    if(lab.mineralType!=type&&creep.store.getUsedCapacity()-creep.store.getUsedCapacity(type)>0){
        WAT(creep,lab,creep.room.terminal,lab.mineralType);
    }else{       
        WAT(creep,creep.room.storage,lab,type);
    }
}
function findMaterial(roomName){
    for(var i in MYREACTIONS){
        for(var j in MYREACTIONS[i]){
            var isum=getAllType(i,roomName);
            var jsum=getAllType(j,roomName);
            var ijsum=getAllType(MYREACTIONS[i][j],roomName);
            if(isum>10&&jsum>10&&ijsum<10000){return [i,j,MYREACTIONS[i][j]];}
        }
    }
    return null;
}
function getAvaliableSpawn(room){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == room && spawn.spawning == null){
            return spawn
        }
    }
    return null;
}
function WAT(creep,withdrawTarget,transferTarget,type){   
    if(creep&&creep.store.getUsedCapacity() == 0){
        if(creep.withdraw(withdrawTarget,type)== ERR_NOT_IN_RANGE){
            creep.moveTo(withdrawTarget);
        }
    }else if(creep){
        if(creep.transfer(transferTarget,Object.keys(creep.store)[0])==ERR_NOT_IN_RANGE){
            creep.moveTo(transferTarget)
        }
    }
}

function autoSpawnCreep(creepName,roomName){
    var spawn = getAvaliableSpawn(roomName)
    if(spawn){
        spawn.spawnCreep(body,creepName)
    }
}
function getAllType(type,roomName){
    var amount = 0;
    var room=Game.rooms[roomName]
    if(room.terminal){amount += room.terminal.store[type]}
    labs.forEach(lab => {
        amount += lab.store[type];
    });
    if(creep){amount += creep.store[type]}
    return amount;
}