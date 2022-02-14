import { errorMapper } from './modules/errorMapper'
import { Sokranotes } from './Sokranotes/Sokranotes';
import "./modules/超级移动优化"
import { HelperCpuUsed } from "./modules/插件cpu监控内置/helper_cpuUsed"
import { HelperRoomResource } from "./modules/全局资源显示插件v1.0/helper_roomResource"

global.HelperCpuUsed = HelperCpuUsed;
global.HelperRoomResource = HelperRoomResource;
global.white_list = new Set(['scp002']);
let rooms: string[] = ['W48S12']
for (let idx in rooms){
    Memory.rooms[rooms[idx]].check_spawn_queue_flag = true
}

/**
 * 全局统计信息扫描器
 * 负责搜集关于 cpu、memory、GCL、GPL 的相关信息
 */
 const stateScanner = function () {
    // 每 20 tick 运行一次
    if (Game.time % 20) return 
  
    if (!Memory.stats) Memory.stats = {}
    
    // 统计 GCL / GPL 的升级百分比和等级
    Memory.stats.gcl = (Game.gcl.progress / Game.gcl.progressTotal) * 100
    Memory.stats.gclLevel = Game.gcl.level
    Memory.stats.gpl = (Game.gpl.progress / Game.gpl.progressTotal) * 100
    Memory.stats.gplLevel = Game.gpl.level
    // CPU 的当前使用量
    Memory.stats.cpu = Game.cpu.getUsed()
    // bucket 当前剩余量
    Memory.stats.bucket = Game.cpu.bucket
}

export const loop = errorMapper(() => {
    if(Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    Sokranotes()

    // 统计全局资源使用
    stateScanner()

    // for(let name in Memory.creeps) {
    //     if(!Game.creeps[name]) {
    //         delete Memory.creeps[name];
    //     }
    //     else{
    //         Game.creeps[name].suicide()
    //     }
    // }

    // for(let name in Memory.rooms) {
    //     delete Memory.rooms[name];
    // }
    if (Game.flags.test){
    // todo
    console.log('incoming')
        for (let transaction of Game.market.incomingTransactions){
            if (transaction.order == undefined){
                console.log(transaction.time, transaction.sender.username, transaction.resourceType, transaction.amount, transaction.from, transaction.to, transaction.description)
            }
        }
        console.log('\noutgoing')
        let s = 0
        for (let transaction of Game.market.outgoingTransactions){
            if (transaction.order == undefined){
                if (transaction.to == 'W41S11'){
                    s = s + transaction.amount
                }
                console.log(transaction.time, transaction.sender.username, transaction.resourceType, transaction.amount, transaction.from, transaction.to, transaction.description)
            }
        }
        console.log(s)
        Game.flags.test.remove()
    }

    if (Game.flags.remove_construction_sites){
        let sites: ConstructionSite[] = Game.flags.remove_construction_sites.room.find(FIND_CONSTRUCTION_SITES)
        for (let site of sites){
            site.remove()
        }
        Game.flags.remove_construction_sites.remove()
    }
    global.HelperCpuUsed.exec()
    // global.HelperCpuUsed.show()
})