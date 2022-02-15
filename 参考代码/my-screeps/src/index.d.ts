interface Memory {
    // 所有 creep 的配置项，每次 creep 死亡或者新增时都会通过这个表来完成初始化
    creepConfigs: {
        [creepName: string]: {
            // creep 的角色名
            role: CreepRoleConstant,
            // creep 的具体配置项，每个角色的配置都不相同
            data: CreepData,
            // 执行 creep 孵化的房间名
            spawnRoom: string,
            // creep 孵化时使用的身体部件
            // 为 string 时则自动规划身体部件，为 BodyPartConstant[] 时则强制生成该身体配置
            bodys: BodyAutoConfigConstant | BodyPartConstant[]
        }
    }
    sourceConfigs:{
        [sourceId:string]:{
            // 绑定ContainerId
            containerId:string,
            room:string,
            /**
             * 资源采集位
             */
            seat:number,
        }
    }
    constructionList:{
        [roomName:string]:{
            [siteId:string]:{
                index:number
            }
        }
    }
}

type CreepRoleConstant = BodyAutoConfigConstant;

/**
 * 所有 creep 角色的 data
 */
type CreepData = EmptyData|HarvesterData | WorkerData;

/**
* 有些角色不需要 data
*/
interface EmptyData { }

/**
* 采集单位的 data
* 执行从 sourceId 处采集东西，并转移至 targetId 处（不一定使用，每个角色都有自己固定的目标例如 storage 或者 terminal）
*/
interface HarvesterData {
    // 要采集的 source id
    sourceId: string
    // 把采集到的资源存到哪里存在哪里
    targetId: string
}

/**
* 工作单位的 data
* 由于由确定的工作目标所以不需要 targetId
*/
interface WorkerData {
    // 要使用的资源存放建筑 id
    sourceId: string
    // 工作目标
    targetId: string
}

/**
 * bodySet
 * 简写版本的 bodyPart[]
 * 形式如下
 * @example { [TOUGH]: 3, [WORK]: 4, [MOVE]: 7 }
 */
interface BodySet {
    [MOVE]?: number
    [CARRY]?: number
    [ATTACK]?: number
    [RANGED_ATTACK]?: number
    [WORK]?: number
    [CLAIM]?: number
    [TOUGH]?: number
    [HEAL]?: number
}

// 本项目中出现的颜色常量
type Colors = 'green' | 'blue' | 'yellow' | 'red'


/**
 * creep 的自动规划身体类型，以下类型的详细规划定义在 setting.ts 中
 */
type BodyAutoConfigConstant =
    'harvester' |
    'worker' |
    'upgrader' |
    'manager' |
    'processor' |
    'reserver' |
    'attacker' |
    'healer' |
    'dismantler' |
    'remoteHarvester'


/**
 * 身体配置项类别
 * 包含了所有角色类型的身体配置
 */
type BodyConfigs = {
    [type in BodyAutoConfigConstant]: BodyConfig
}

/**
 * 单个角色类型的身体部件配置
 * 其键代表房间的 energyAvailable 属性
 * 300 就代表房间能量为 0 ~ 300 时应该使用的身体部件，该区间前开后闭
 * 例如：房间的 energyAvailable 为 600，则就会去使用 800 的身体部件，
 */
type BodyConfig = {
    [energyLevel in 300 | 550 | 800 | 1300 | 1800 | 2300 | 5600 | 10000]: BodyPartConstant[]
}

interface StructureSpawn {
    getBodys(bodyType: BodyAutoConfigConstant): BodyPartConstant[];
}

interface StructureTower{
    work():void;
}

interface Creep{
    /**
     * 发送日志
     * 
     * @param content 日志内容
     * @param instanceName 发送日志的实例名
     * @param color 日志前缀颜色
     * @param notify 是否发送邮件
     */
    log(content:string, color?: Colors, notify?: boolean): void

    _id: string
    _move(direction: DirectionConstant | Creep): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET
}

interface RoomMemory{
    storageId:string;
    containerIds:string[];
    mineralId:string;
    sourceIds:string[];
}

interface Room{
    _storage:Storage;
    _containers:StructureContainer[];
    _mineral:Mineral;
    _sources:Source[]
}
