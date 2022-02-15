export enum RoleType{
    Harvester='harvester',
    Builder='builder',
    Upgrader='upgrader',
    Worker='worker',
    Manager='manager',
}

/**
 * 根据身体配置生成完成的身体数组
 * cpu 消耗: 0.028 左右
 * 
 * @param bodySet 身体部件配置对象
 */
 export function calcBodyPart(bodySet: BodySet): BodyPartConstant[] {
    // 把身体配置项拓展成如下形式的二维数组
    // [ [ TOUGH ], [ WORK, WORK ], [ MOVE, MOVE, MOVE ] ]
    const bodys = Object.keys(bodySet).map(type => Array(bodySet[type]).fill(type))
    // 把二维数组展平
    return [].concat(...bodys)
}

/**
 * 在绘制控制台信息时使用的颜色
 */
 const colors: { [name in Colors]: string } = {
    red: '#ef9a9a',
    green: '#6b9955',
    yellow: '#c5c599',
    blue: '#8dc5e3'
}

/**
 * 给指定文本添加颜色
 * 
 * @param content 要添加颜色的文本
 * @param colorName 要添加的颜色常量字符串
 * @param bolder 是否加粗
 */
 export function colorful(content: string, colorName: Colors = null, bolder: boolean = false): string {
    const colorStyle = colorName ? `color: ${colors[colorName]};` : ''
    const bolderStyle = bolder ? 'font-weight: bolder;' : ''

    return `<text style="${[ colorStyle, bolderStyle ].join(' ')}">${content}</text>`
}

/**
 * 全局日志
 * 
 * @param content 日志内容
 * @param prefixes 前缀中包含的内容
 * @param color 日志前缀颜色
 * @param notify 是否发送邮件
 */
 export function log(content: string, prefixes: string[] = [], color: Colors = null, notify: boolean = false): OK {
    // 有前缀就组装在一起
    let prefix = prefixes.length > 0 ? `【${prefixes.join(' ')}】 ` : ''
    // 指定了颜色
    prefix = colorful(prefix, color, true)

    const logContent = `${prefix}${content}`
    console.log(logContent)
    // 转发到邮箱
    if (notify) Game.notify(logContent)

    return OK
}

/**
 * 生成控制台链接
 * @param content 要显示的内容
 * @param url 要跳转到的 url
 * @param newTab 是否在新标签页打开
 */
 export function createLink(content: string, url: string, newTab: boolean = true): string {
    return `<a href="${url}" target="${newTab ? '_blank' : '_self'}">${content}</a>`
}

/**
 * 给房间内添加跳转链接
 * 
 * @param roomName 添加调整链接的房间名
 * @returns 打印在控制台上后可以点击跳转的房间名
 */
 export function createRoomLink(roomName): string {
    return createLink(roomName, `https://screeps.com/a/#!/room/${Game.shard.name}/${roomName}`, false)
}

/**
 * 把 obj2 的原型合并到 obj1 的原型上
 * 如果原型的键以 Getter 结尾，则将会把其挂载为 getter 属性
 * @param obj1 要挂载到的对象
 * @param obj2 要进行挂载的对象
 */
 export const assignPrototype = function(obj1: {[key: string]: any}, obj2: {[key: string]: any}) {
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            })
        }
        else obj1.prototype[key] = obj2.prototype[key]
    })
}