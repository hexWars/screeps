
import { assignPrototype } from "@/utils"
import SpawnExtension from './spawn'
import TowerExtension from "./tower"

// 拓展和原型的对应关系
const assignMap = [
    [ StructureSpawn, SpawnExtension ],
    [ StructureTower, TowerExtension ],
]

// 挂载拓展到建筑原型
export default () => {

    // 挂载所有拓展
    assignMap.forEach(protos => assignPrototype(protos[0], protos[1]))
}
