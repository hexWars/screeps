// 刚开始的时候，300档可以改成300， 3， 1， 1，不追求source挤占问题
// let number_list: number[][] = [
//     //MOVE WORK CARRY
//     [300, 1, 2, 1],
//     [350, 2, 2, 1],
//     [400, 3, 2, 1],
//     [450, 2, 3, 1],
//     [500, 3, 3, 1],
//     [550, 4, 3, 1],
//     [600, 5, 3, 1],
//     [650, 6, 3, 1],
//     [700, 5, 4, 1],
//     [750, 6, 4, 1],
//     [800, 7, 4, 1],
// ];

var harvesters0Num: number = 0
var harvesters1Num: number = 0

// var upgradersNum: number = 5;
var upgradersNum: number = 1;
var left_fetcherNum: number = 0;
var repairersNum: number = 2;
var buildersNum: number = 1;
var minerNum: number = 0;

// var soliderNum: number = 10;
var soliderNum: number = 0;

// var transferNum: number = 3;
// var outharvesterNum: number = 1;
// var transfer1Num: number = 4;
// var outharvester1Num: number = 1;

var transferNum: number = 0;
var outharvesterNum: number = 0;
var transfer1Num: number = 0;
var outharvester1Num: number = 0;

var minerNum: number = 0;
var harderNum: number = 0;
var doctorNum: number = 0;
var cleanerNum: number = 1;
var base_transferNum: number = 0;

// var carrierNum: number = 1;
// var reserverNum: number = 1;

var carrierNum: number = 0;
var reserverNum: number = 0;

const body_list: BodyPartConstant[][]= [
    [WORK, WORK, CARRY, MOVE], // 300
    [WORK, WORK, CARRY, MOVE, MOVE], // 350
    [WORK, WORK, CARRY, MOVE, MOVE, MOVE], //400
    [WORK, WORK, WORK, CARRY, MOVE, MOVE], //450
    [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], //500
    [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], //550
    [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], //600
    [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], //650
    [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], // 700
    [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], //750 
    [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 800
];

export const spawn_work = function(
    roomName: string, 
    spawnName?: string)
{
    var home: Room = Game.rooms[roomName]
    var energyCapacityAvailable: number = home.energyCapacityAvailable;
    var energyAvailable: number = home.energyAvailable;
    var war_flag: boolean = false

    // var closestHostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    // if (closestHostiles){
    //     if (closestHostiles.length > 1){
    //         war_flag = true
    //         soliderNum = Math.floor(closestHostiles.length * 1.5) + 1
    //     }
    // }

    // else 
    if (Game.spawns['Spawn1'].spawning){
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    else{
        var doctors = _.filter(Game.creeps, (creep) => creep.memory.role == 'doctor');
        var cleaners = _.filter(Game.creeps, (creep) => creep.memory.role == 'cleaner');
        var outharvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'outharvester' && creep.ticksToLive > 200);
        var outharvester1s = _.filter(Game.creeps, (creep) => creep.memory.role == 'outharvester1'  && creep.ticksToLive > 200);
        var energy_harvesters_no_carry = _.filter(Game.creeps, (creep) => creep.memory.role == 'energy_harvester_no_carry');

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var harvesters0 = _.filter(harvesters, ((creep) => creep.memory.source_idx == 0));
        var harvesters1 = _.filter(harvesters, ((creep) => creep.memory.source_idx == 1));

        var base_transfers = _.filter(Game.creeps, ((creep) => creep.memory.role == 'base_transfer'));

        //Emergency situation
        //else if (harvesters.length == 0){
        if (harvesters.length == 0 && outharvesters.length == 0 && energy_harvesters_no_carry.length == 0){
            var newName = 'Harvester' + Game.time;
            var idx = Math.floor((energyAvailable-300) / 50);
            if (idx >= 0){
                if (idx > 10) idx = 10
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 1}});
                // console.log('Spawning new harvester: ' + newName  + " body: " + body_list[idx]);
            }
            else{
                // console.log('lack of energy, energyAvailable: ' + energyAvailable);
            }
        }
        
        // routine
        else if (energyAvailable >= 600 && doctors.length < doctorNum)
        {
            var newName = 'Doctor' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([HEAL, HEAL, MOVE, MOVE], newName, {memory: {role: 'doctor'}});
            // Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 1}});
            // console.log('Spawning new Doctor: ' + newName  + " body: 2 HEAL  2 MOVE");
        }
        else if (energyAvailable >= 800){

            // var worker0 = _.filter(Game.creeps, ((creep) => creep.memory.source_idx == 0));
            // var worker1 = _.filter(Game.creeps, ((creep) => creep.memory.source_idx == 1));
            // console.log('0 far:' + worker0.length)
            // console.log('1 clo:' + worker1.length)
            var idx = Math.floor((energyAvailable-300) / 50);
            if (idx > 10) idx = 10

            var constructions = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES);
            
            // console.log("constructions.length:", constructions.length, ' ', buildersNum);
            // console.log(constructions.length == 0);
            if (constructions.length == 0)
            {
                buildersNum = 0
            }

            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
            var left_fetchers = _.filter(Game.creeps, (creep) => creep.memory.role == 'left_fetcher');

            var harders = _.filter(Game.creeps, (creep) => creep.memory.role == 'harder');

            var transfers = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer');
            var transfer1s = _.filter(Game.creeps, (creep) => creep.memory.role == 'transfer1');

            var carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.ticksToLive > 50);

            var reservers = _.filter(Game.creeps, (creep) => creep.memory.role == 'reserver' && creep.ticksToLive > 80);

            // console.log('***************reuqired number with different role****************')
            // console.log('harvester0: ' + harvesters0.length + "\t" + harvesters0Num);
            // console.log('harvester1: ' + harvesters1.length + "\t" + harvesters1Num);
            // console.log('Upgraders : ' + upgraders.length + "\t" + upgradersNum);
            // console.log('Lfetcher  : ' + left_fetchers.length + "\t" + left_fetcherNum);
            // console.log('Repairer  : ' + repairers.length + "\t", repairersNum);
            // console.log('Builders  : ' + builders.length + "\t", buildersNum);
            // console.log('Miner     : ' + miners.length + "\t", minerNum);

            // console.log('Harder    : ' + harders.length + "\t", harderNum);
            // console.log('Doctor    : ' + doctors.length + "\t", doctorNum);

            // console.log('Transfer  : ' + transfers.length + "\t", transferNum);
            // console.log('Out harves: ' + outharvesters.length + "\t", outharvesterNum);
            // console.log('Transfer1 : ' + transfer1s.length + "\t", transfer1Num);
            // console.log('Out harv1s: ' + outharvester1s.length + "\t", outharvester1Num);
            // console.log('Cleaner   : ' + cleaners.length + "\t", cleanerNum);
            // console.log('Basetrsasf: ' + base_transfers.length + "\t", base_transferNum);
            
            var controller: StructureController = Game.getObjectById("5bbcaa729099fc012e631609")
            // console.log(controller)
            // if (controller != null){
            //     console.log(controller.reservation)
            // }
            // console.log(controller.reservation.ticksToEnd)
            // console.log(reservers.length)
            // console.log(controller.reservation.ticksToEnd < 3000 && reservers.length < reserverNum)
            if (war_flag){
                // status check
                if (Game.spawns['Spawn1'].spawning){
                    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
                    Game.spawns['Spawn1'].room.visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        Game.spawns['Spawn1'].pos.x + 1, 
                        Game.spawns['Spawn1'].pos.y, 
                        {align: 'left', opacity: 0.8});
                }
                else {
                        
                        if (energyAvailable >= 1100){
                        var soldiers = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.hits >= 0.8 * creep.hitsMax);
                        if(soldiers.length < soliderNum){
                            // console.log('Soldiers  : ' + soldiers.length + "\t" + soliderNum);
                            var newName = 'Soldier' + Game.time;
                            Game.spawns['Spawn1'].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, MOVE], newName, {memory: {role: 'soldier'}});
                            // console.log('Spawning new soldier: ' + newName  + " body: " + '[TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE]');
                        }
                    }
                }
            }
            if (Game.spawns['Spawn1'].spawning){
                ;
            }
            else if(harders.length < harderNum){
                var newName = 'Harder' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, 
                                                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'harder'}});
                // console.log('Spawning new Harder: ' + newName  + " body: 13 TOUGH  13MOVE");
            }
            else if (builders.length < 0.5*buildersNum)
            {
                var newName = 'Builder' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'builder'}});
                // console.log('Spawning new builder  : ' + newName  + " body: body: WORK 5, CARRY 2, MOVE 7");
            }
            else if (carriers.length < carrierNum){
                var newName = 'Carrier' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], newName, {memory: {role: 'carrier'}});
                // console.log('Spawning new carrier: ' + newName  + " body: CARRY 16 MOVE 1");
            }
            else if (reservers.length < reserverNum){
                if (controller != null && controller != undefined){
                    if (controller.reservation == undefined){
                        var newName = 'reserver' + Game.time;
                        Game.spawns['Spawn1'].spawnCreep([CLAIM, CLAIM, MOVE, MOVE], newName, {memory: {role: 'reserver', source_idx: 1}});
                        // console.log('Spawning new reserver: ' + newName  + " body: CLAIM 2 MOVE 2");
                    }
                    else{
                        if (controller.reservation.ticksToEnd < 3000 && reservers.length < reserverNum){
                            var newName = 'reserver' + Game.time;
                            Game.spawns['Spawn1'].spawnCreep([CLAIM, CLAIM, MOVE, MOVE], newName, {memory: {role: 'reserver', source_idx: 1}});
                            // console.log('Spawning new reserver: ' + newName  + " body: CLAIM 2 MOVE 2");
                        }
                    }
                }
            }
            else if (base_transfers.length < base_transferNum){
                var newName = 'base_transfer' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {memory: {role: 'base_transfer', source_idx: 1}});
                // console.log('Spawning new harvester: ' + newName  + " body: CARRY 2 MOVE 3");
            }
            else if(harvesters1.length < 0.5*harvesters1Num) {
                var newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 1}});
                // console.log('Spawning new harvester: ' + newName  + " body: " + body_list[idx]);
            }
            else if(harvesters0.length < 0.5*harvesters0Num) {
                var newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 0}});
                // console.log('Spawning new harvester: ' + newName  + " body: " + body_list[idx]);
            }
            else if (outharvesters.length < 0.5*outharvesterNum){
                var newName = 'Out Havester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'outharvester'}});
                // console.log('Spawning new outharvester: ' + newName  + " body: WORK 5, CARRY 5, MOVE 5");
            }
            else if (transfers.length < 0.5*transferNum){
                var newName = 'Transfer' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], newName, {memory: {role: 'transfer'}});
                // console.log('Spawning new transfer: ' + newName  + " body: CARRY, MOVE");
            }
            else if (outharvester1s.length < 0.5*outharvester1Num){
                var newName = 'Out Havester1 ' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'outharvester1'}});
                // console.log('Spawning new outharvester: ' + newName  + " body: WORK 5, CARRY 5, MOVE 5");
            }
            else if (transfer1s.length < 0.5*transfer1Num){
                var newName = 'Transfer1 ' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], newName, {memory: {role: 'transfer1'}});
                // console.log('Spawning new transfer1: ' + newName  + " body: CARRY, MOVE");
            }
            else if(upgraders.length < 0.5*upgradersNum) {
                var newName = 'Upgrader' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
                                                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
                                                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'upgrader'}});
                // console.log('Spawning new upgrader : ' + newName  + " body: WORK 5, CARRY 2, MOVE 7");
                
            }
            else if(repairers.length < 0.5*repairersNum) {
                var newName = 'Repairer' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'repairer'}});
                // console.log('Spawning new repairer : ' + newName  + " body:" + body_list[idx]);
            }
            else if(harvesters1.length < harvesters1Num) {
                var newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 1}});
                // console.log('Spawning new harvester: ' + newName  + " body: " + body_list[idx]);
            }
            else if(harvesters0.length < harvesters0Num) {
                var newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'harvester', source_idx: 0}});
                // console.log('Spawning new harvester: ' + newName  + " body: " + body_list[idx]);
            }
            else if (outharvesters.length < outharvesterNum){
                var newName = 'Out Havester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'outharvester'}});
                // console.log('Spawning new outharvester: ' + newName  + " body: WORK 5, CARRY 5, MOVE 5");
            }
            else if (transfers.length < transferNum){
                var newName = 'Transfer' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], newName, {memory: {role: 'transfer'}});
                // console.log('Spawning new transfer: ' + newName  + " body: CARRY, MOVE");
            }
            else if (outharvester1s.length < outharvester1Num){
                var newName = 'Out Havester1 ' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'outharvester1'}});
                // console.log('Spawning new outharvester: ' + newName  + " body: WORK 5, CARRY 5, MOVE 5");
            }
            else if (transfer1s.length < transfer1Num){
                var newName = 'Transfer1 ' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], newName, {memory: {role: 'transfer1'}});
                // console.log('Spawning new transfer1: ' + newName  + " body: CARRY, MOVE");
            }
            else if(upgraders.length < upgradersNum) {
                var newName = 'Upgrader' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'upgrader'}});
                // console.log('Spawning new upgrader : ' + newName  + " body: " + body_list[idx]);
                
            }
            else if(repairers.length < repairersNum) {
                var newName = 'Repairer' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'repairer'}});
                // console.log('Spawning new repairer : ' + newName  + " body:" + body_list[idx]);
            }
            else if (builders.length < buildersNum)
            {
                var newName = 'Builder' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'builder'}});
                // console.log('Spawning new builder  : ' + newName  + " body: " + body_list[idx]);
            }
            else if (cleaners.length <= cleanerNum && cleaners.length < cleanerNum)
            {
                var newName = 'Cleaner' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, {memory: {role: 'cleaner'}})
                // console.log('Spawning new cleaner  : ' + newName  + " body: CARRY, MOVE");
            }
           
                // else if (left_fetchers.length < left_fetcherNum){
                //     var newName = 'Left_fetchers' + Game.time;
                //     Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'left_fetcher', source_idx: source_idx}});
                //     console.log('Spawning new left_fetcher: ' + newName  + " body: " + body_list[idx]);
                // }
                // else if(miners.length < mimerNum) {
                //     var newName = 'Miner' + Game.time;
                //     Game.spawns['Spawn1'].spawnCreep(body_list[idx], newName, {memory: {role: 'miner'}});
                //     console.log('Spawning new miner    : ' + newName  + " body:  " + body_list[idx]);
                // }
        }
    }
}