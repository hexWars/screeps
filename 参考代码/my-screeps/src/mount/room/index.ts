import Extension from './extension'
import { assignPrototype } from '@/utils'

// 定义好挂载顺序
const plugins = [  Extension ]

/**
 * 依次挂载所有的 Room 拓展
 */
export default () => plugins.forEach(plugin => assignPrototype(Room, plugin))