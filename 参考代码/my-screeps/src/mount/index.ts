import mountCreep from './creep'
import mountRoom from './room'

/**
 * 挂载所有的属性和方法
 */
export default function (): void {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展')

        // 存储的兜底工作
        initStorage()

        // 挂载全部拓展
        mountRoom()
        mountCreep()

        global.hasExtension = true
    }
}

/**
 * 初始化存储
 */
function initStorage() {
    if (!Memory.rooms) Memory.rooms = {}
    else delete Memory.rooms.undefined

    //if (!Memory.stats) Memory.stats = { rooms: {} }
    if (!Memory.creepConfigs) Memory.creepConfigs = {}
    if (!global.routeCache) global.routeCache = {}
    if (!global.resourcePrice) global.resourcePrice = {}
}