import SpawnExtension from './StructureSpawnMock'
import TowerExtension from "./StructureTower"

// 拓展和原型的对应关系
// const assignMap = [
//     [ StructureSpawn, SpawnExtension ],
//     [ StructureTower, TowerExtension ],
// ]


// 挂载拓展到建筑原型
export default () => {
    Object.assign(global, {StructureSpawn:SpawnExtension});
    
    Object.assign(global, {StructureTower:TowerExtension});
}