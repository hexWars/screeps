import { bodyConfigs } from '@/setting'

/**
 * Spawn 原型拓展
 */
 export default class SpawnExtension extends StructureSpawn {
     
    /**
     * 获取身体部件数组
     * 
     * @param bodyType creepConfig 中的 bodyType
     */
    public getBodys(bodyType: BodyAutoConfigConstant): BodyPartConstant[] {
        const bodyConfig: BodyConfig = bodyConfigs[bodyType]

        const targetLevel = Object.keys(bodyConfig).reverse().find(level => {
            // 先通过等级粗略判断，再加上 dryRun 精确验证
            const availableEnergyCheck = (Number(level) <= this.room.energyAvailable)
            const dryCheck = (this.spawnCreep(bodyConfig[level], 'bodyTester', { dryRun: true }) == OK)

            return availableEnergyCheck && dryCheck
        })
        if (!targetLevel) return [ ]

        // 获取身体部件
        const bodys: BodyPartConstant[] = bodyConfig[targetLevel]

        return bodys
    }
 }