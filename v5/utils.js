/**
 * 命令可控制
 * todo
 * @param creep
 */
export const help = function (creep) {
}

/**
 * 扫描全局状态
 */
export const stateScanner = function () {
    if (Game.time % 20) return

    if (!Memory.stats) Memory.stats = { rooms: {} }

    // 统计 GCL / GPL 的升级百分比和等级
    Memory.stats.gcl = (Game.gcl.progress / Game.gcl.progressTotal) * 100,
        Memory.stats.gclLevel = Game.gcl.level,
        Memory.stats.gpl = (Game.gpl.progress / Game.gpl.progressTotal) * 100,
        Memory.stats.gplLevel = Game.gpl.level,
        // CPU 的当前使用量
        Memory.stats.cpu = Game.cpu.getUsed(),
        // bucket 当前剩余量
        Memory.stats.bucket = Game.cpu.bucket
    // 统计剩余钱数
    Memory.stats.credit = Game.market.credits
}
/**
 * 清理内存
 */
export const clearMemory = () => {
    if (Game.time % 5) return
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];// 清除内存
        }
    }
}

/**
 * 生成 pixel
 *
 * @param cpuLimit 当 bucket 中的 cpu 到多少时才生成 pixel
 */
export const generatePixel = (cpuLimit = 7000) => {
    if (Game.cpu.bucket >= cpuLimit) Game.cpu.generatePixel()
}
