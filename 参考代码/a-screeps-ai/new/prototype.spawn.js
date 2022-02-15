var runspawn = {
    run: function(roomName){     
        //获取spawn----------------------------------------------------------------------------
        var spawn=getAvaliableSpawn(roomName)
        if(spawn==null)return 'NO FREE SPAWN';
        //初始化---------------------------------------------------------------------------------------------------     
        let room = Game.rooms[roomName];
        let creepsindex= room.find(FIND_HOSTILE_CREEPS);  
        let control=room.controller
        let avaEnergy = room.energyAvailable;   
        let maxEnergy = room.energyCapacityAvailable;
        var Outclaimer= _.filter(Game.creeps, (creep)=> creep.memory.role=='outclaimer');
        var Moverout = _.filter(Game.creeps, (creep)=> creep.memory.role == 'moverout');
        var Workers = _.filter(Game.creeps, (creep)=> creep.memory.role == 'worker');
        var harvesters = _.filter(Game.creeps, (creep)=> creep.memory.role == 'harvester'&&creep.room.name==room.name);
        var harvesterbingans=_.filter(Game.creeps, (creep)=> creep.memory.role == 'harvesterbingan'&&creep.room.name==room.name);
        var indexlength= _.filter(creepsindex, c => c.hitsMax>1500);
        //命名-----------------------------------------------------------------------------
        function getname(role,i){
            var name;   
            i=i+1;              
            name=role+room.name+"-"+i;
            return name;                 
        }
        //-------------------------------------------------------------------------------------------------------------------------------------
        //自动防御-----------------------------------------------------------------------------------------------------------------------
        if((creepsindex.length>=4||indexlength.length>=4)){
            var newName = 'Guard' +room.name+Game.time;
            let avaEnergy1 = room.energyAvailable;
            var numberOfParts = Math.floor(avaEnergy1 / 1080);               
            numberOfParts = Math.min(numberOfParts, Math.floor(48 / 12));
            var body = [];
            for (let i = 0; i < numberOfParts*3; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < numberOfParts*4; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < numberOfParts*4; i++) {
                body.push(RANGED_ATTACK);
            }
            spawn.spawnCreep(body, newName,{memory: {role:'guarder'}});             
        } 
        else if(Memory.resourse[room.name]){
            //能量采集------------------------------------------------------------------------------------------------------------------------------------------
            if(maxEnergy<=300){
                //能量采集初始化
                for (var i=0;i<Memory.resourse[room.name].length;i++) {
                    var source=Memory.resourse[room.name][i]
                    if (!_.some(Game.creeps, c => c.memory.role == 'harvesterbingan' && c.memory.sourceId == source.id)) {
                            var numberOfParts = Math.floor(avaEnergy / 200);
                            numberOfParts = Math.min(numberOfParts, Math.floor(13 / 3));
                            var body = [];
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(WORK);
                                body.push(CARRY);
                                body.push(MOVE);
                            }
                            spawn.spawnCreep(body, 'ha_' + source.id,{memory: { role: 'harvesterbingan', sourceId: source.id }});
                    }
                }     
            }
            else{           
            //资源采集  
                for (var i=0;i<Memory.resourse[room.name].length;i++) {
                    var source=Memory.resourse[room.name][i]
                    if (!_.some(Game.creeps, c => c.memory.role == 'harvester' && c.memory.sourceId == source.id)) {
                        if(source.id==undefined)continue
                        var numberOfParts = Math.floor((avaEnergy-100 )/ 100);
                        numberOfParts = Math.min(numberOfParts, Math.floor(19 / 3));
                        var body = [];
                        if(numberOfParts==0)numberOfParts=1
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                        }
                        body.push(CARRY);
                        body.push(MOVE);
                        spawn.spawnCreep(body, 'h_' + source.id,{memory: {role: 'harvester',home:spawn.room.name, sourceId: source.id , containerId:source.container ,linkerId:source.linker}});
                    }
                }   
                //采集矿物  
                var minerals1=spawn.room.mineral
                if(minerals1.mineralAmount>0){
                    if (!_.some(Game.creeps, c => c.memory.role == 'miner' && c.memory.minerID == minerals1.id)) {
                        if (Memory.minerals[room.name].container&&Memory.minerals[room.name].extractor) {
                            var numberOfParts = Math.floor((avaEnergy-400) / 100);
                            numberOfParts = Math.min(numberOfParts, Math.floor(45 / 1));
                            var body = [];
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(WORK);
                            }
                            for (let i = 0; i < 5; i++) {
                                body.push(MOVE);
                            }
                            if(numberOfParts>0){
                                spawn.spawnCreep(body, 'mi_' + minerals1.id,{memory: {role: 'miner', minerID: minerals1.id }});
                            }  
                        }
                    }
                    //转运矿物---------------------------------------------------------------------------------------------------------------------------------
                    if (!_.some(Game.creeps, c => c.memory.role == 'mover2' && c.memory.minerID == minerals1.id)) {
                        if (Memory.minerals[room.name].extractor&&Memory.minerals[room.name].container) {
                            var numberOfParts = Math.floor(avaEnergy / 150);
                            numberOfParts = Math.min(numberOfParts, Math.floor(19 / 3));
                            var body = [];
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(CARRY);
                                body.push(CARRY);
                                body.push(MOVE);
                            }                            
                            spawn.spawnCreep(body, 'mo2_' + minerals1.id,{memory: { role: 'mover2', minerID: minerals1.id }});
                        }
                    }   
                }   
            }   
            //建筑-----------------------------------------------------------------------------------------------------------------------------------
            var targetsde = room.find(FIND_CONSTRUCTION_SITES);
            if(targetsde.length>0&&(harvesters.length>=Memory.resourse[room.name].length||harvesterbingans.length>=Memory.resourse[room.name].length)){
                var sum=2;if(room.controller.level<=4)sum=4;
                if(room.name=='W15S1')sum=3
                for( let i = 0 ; i <sum; i++ ){
                    var newName = getname('builder',i);
                    var numberOfParts = Math.floor(avaEnergy / 200);
                    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
                    var body = [];
                    for (let i = 0; i < numberOfParts; i++) {
                        body.push(WORK);
                        body.push(CARRY);
                        body.push(MOVE);
                    }
                    spawn.spawnCreep(body, newName, {memory: {role: 'builder',home:spawn.room.name}});
                }      
            }
            const storage1 = room.storage;
            //升级控制器-----------------------------------------------------------------------------------------------------------------------
            if(maxEnergy<400){
                //升级控制器
                if((harvesters.length>=Memory.resourse[room.name].length||harvesterbingans.length==Memory.resourse[room.name].length)) {
                    var newName = 'Upgrader1';
                    spawn.spawnCreep([WORK,CARRY,MOVE], newName, 
                        {memory: {role: 'upgrader',home:spawn.room.name}});
                }
            }
            else{
                //升级控制器   
                let num=1;let upsum=1;let maxhold=1
                if(room.controller.level>=4){num=4}
                if(room.controller.level==8)(room.controller.ticksToDowngrade<150000)?(upsum=1):(upsum=0)               
                if(room.controller.level!=8&&storage1)maxhold=Math.floor(storage1.store[RESOURCE_ENERGY]/8000)
                if(harvesters.length>=Memory.resourse[room.name].length||harvesterbingans.length==Memory.resourse[room.name].length) {
                    for( let i = 0 ; i < upsum ; i++ ){
                        var newName = getname('upgrader',i);
                        var numberOfParts = Math.min(Math.floor((avaEnergy-50*num-50) / 100), maxhold);
                        var numberOfParts = Math.min(numberOfParts, 45);
                        var body = [];
                        if(room.controller.level==8){numberOfParts=1;num=1}
                        body.push(CARRY);
                        for (let i = 0; i < num; i++) {body.push(MOVE);}
                        for (let i = 0; i < numberOfParts; i++) {body.push(WORK);}
                        if(numberOfParts>=1){ 
                            spawn.spawnCreep(body, newName, {memory: {role: 'upgrader',home:spawn.room.name}});
                        }                       
                    }                   
                }
            }
            //维修----------------------------------------------------------------------           
            if(storage1&&control.level>=4){
                if(storage1.store[RESOURCE_ENERGY]>500000&&(harvesters.length>=Memory.resourse[room.name].length||harvesterbingans.length==Memory.resourse[room.name].length)) {
                    for( let i = 0 ; i < 1 ; i++ ){
                        var newName = getname('repair',i) ;
                        var numberOfParts = Math.floor(avaEnergy / 200);
                        numberOfParts = Math.min(numberOfParts, Math.floor(16 / 3));
                        var body = [];
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                        spawn.spawnCreep(body, newName, {memory: {role: 'repair'}});
                    }                   
                }  
            }   
            //power
            if(room.powerSpawn&&(storage1.store[RESOURCE_POWER]>0||room.terminal.store[RESOURCE_POWER]>0)){
                for( let i = 0 ; i < 1 ; i++ ){
                    var newName = getname('mp',i);
                    spawn.spawnCreep([CARRY,CARRY,MOVE],newName,{memory:{role:'mp'}});
                } 
            } 
        }
        


        if(harvesters.length>=Memory.resourse[room.name].length||harvesterbingans.length==Memory.resourse[room.name].length){
            //能量运输---------------------------------------------------------------------------------------------------------------------
            if(Memory.mover[room.name]&&Memory.mover[room.name].tcontainer){
                for( let i = 0 ; i < 1 ; i++ ){
                    var newName = getname('mover1',i);
                    spawn.spawnCreep([CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],newName,{memory:{role:'mover1'}});
                } 
            }                                           
            //运输
            for (var i=0;i<Memory.resourse[room.name].length;i++) {
                var source=Memory.resourse[room.name][i]
                if (!_.some(Game.creeps, c => c.memory.role == 'mover' && c.memory.sourceId == source.id)) {
                    var newName = 'mo'+i+Game.time%100;
                    var numberOfParts = Math.floor(avaEnergy / 150);
                    numberOfParts = Math.min(numberOfParts, Math.floor(25 / 3));
                    var body = [];
                    for (let i = 0; i < numberOfParts; i++) {
                        body.push(CARRY);
                        body.push(MOVE);
                        body.push(CARRY);
                    }
                    spawn.spawnCreep(body,newName,{memory:{role:'mover', sourceId: source.id, containerId:source.container}});
                }
            }             
            //外部能量
            if(Moverout.length<0){
                var newName = 'Moverout' + Game.time;
                var body = [];
                for (let i = 0; i < 8; i++) {
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(CARRY);
                }      
                spawn.spawnCreep(body,newName,{memory:{role:'moverout',home:'W34N8',target:'W33N8'}});
            }
        }
        //拆迁大队---------------------------------------------------------------------------------------------------------------------
        if(Workers.length<0){
            var newName='Worker'+Game.time;
            var body = [];
            for (let i = 0; i < 15; i++) {
                body.push(WORK);
                body.push(MOVE);
                body.push(WORK);
            } 
            spawn.spawnCreep(body, newName,{memory: {role:'worker',target:'W33N7'}});  
        } 
        //殖民------------------------------------------------------------------------------------------------
        if(0){claimroom('W28N6');} 
        function claimroom(roomname){
            if(spawn.room.name=='W31N7'){
                if(Game.rooms[roomname]==undefined){
                    if(Outclaimer.length<1){
                        var newName = 'claimer' +Outclaimer.length;
                        spawn.spawnCreep([CLAIM,MOVE,MOVE],newName,
                            {memory:{role:'outclaimer',target:roomname}});
                    }
                }
                if(Outclaimer.length==1||Game.rooms[roomname]!=undefined){
                    var bout=_.filter(Game.creeps, c => c.memory.role == 'builder' && c.memory.home == roomname)         
                    if (bout.length<4){
                        var newName = 'bo'+Game.time;
                        var numberOfParts = Math.floor(avaEnergy / 250);
                        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 4));
                        var body = [];
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY); 
                            body.push(MOVE);
                            body.push(MOVE);
                        }
                        spawn.spawnCreep(body, newName, {memory: {role: 'builder',home:roomname}});
                    }  
                    if(0){
                        var gout=_.filter(Game.creeps, c => c.memory.role == 'guarder' && c.memory.target == roomname)
                        if (gout.length<0){
                            var newName = 'Guard hu' + Game.time;
                            spawn.spawnCreep([TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL], newName,
                                {memory: {role:'guarder',target:roomname}});
                        } 
                    }
                }  
            }     
        }                  
    }
}
module.exports = runspawn;
function getAvaliableSpawn(room){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == room && spawn.spawning == null){
            return spawn
        }
    }
    return null;
}