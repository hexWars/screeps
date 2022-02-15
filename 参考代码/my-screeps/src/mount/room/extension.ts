import {createRoomLink, log} from '@/utils'

// creep 原型拓展
export default class RoomExtension extends Room {
    /**
     * 全局日志
     * 
     * @param content 日志内容
     * @param prefixes 前缀中包含的内容
     * @param color 日志前缀颜色
     * @param notify 是否发送邮件
     */
    log(content:string, instanceName: string = '', color: Colors | undefined = undefined, notify: boolean = false): void {
        // 为房间名添加超链接
        const roomName = createRoomLink(this.name)
        // 生成前缀并打印日志
        const prefixes = instanceName ? [ roomName, instanceName ] : [ roomName ]
        log(content, prefixes, color, notify)
    }
    /**
     * Mineral 访问器
     * 
     * 读取房间内存中的 mineralId 重建 Mineral 对象。
     * 如果没有该字段的话会自行搜索并保存至房间内存
     */
     public mineralGetter(): Mineral {
        if (this._mineral) return this._mineral

        // 如果内存中存有 id 的话就读取并返回
        // mineral 不会过期，所以不需要进行处理
        if (this.memory.mineralId) {
            this._mineral = Game.getObjectById(this.memory.mineralId)
            return this._mineral
        }

        // 没有 id 就进行搜索
        const mineral = this.find(FIND_MINERALS)[0]
        if (!mineral) {
            this.log(`异常访问，房间内没有找到 mineral`, 'roomBase', 'yellow')
            return undefined
        }

        // 缓存数据并返回
        this.memory.mineralId = mineral.id
        this._mineral = mineral
        return this._mineral
    }
    
    /**
     * Source 访问器
     * 
     * 工作机制同上 mineral 访问器
     */
    public sourcesGetter(): Source[] {
        if (this._sources) return this._sources

        // 如果内存中存有 id 的话就读取并返回
        // source 不会过期，所以不需要进行处理
        if (this.memory.sourceIds) {
            this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id))
            return this._sources
        }

        // 没有 id 就进行搜索
        const sources = this.find(FIND_SOURCES)
        if (sources.length <= 0) {
            this.log(`异常访问，房间内没有找到 source`, 'roomBase', 'yellow')
            return undefined
        }

        // 缓存数据并返回
        this.memory.sourceIds = sources.map(s => s.id)
        this._sources = sources
        return this._sources
    }

}