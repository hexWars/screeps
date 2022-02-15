 /**
 * 伪造全局 StructureSpawn 类
 */
  export default class StructureSpawnMock {
    readonly prototype: StructureSpawn;
    /**
     * The amount of energy containing in the spawn.
     * @deprecated An alias for .store[RESOURCE_ENERGY].
     */
    energy: number;
    /**
     * The total amount of energy the spawn can contain
     * @deprecated An alias for .store.getCapacity(RESOURCE_ENERGY).
     */
    energyCapacity: number;
    /**
     * A shorthand to `Memory.spawns[spawn.name]`. You can use it for quick access
     * the spawn’s specific memory data object.
     *
     * @see http://docs.screeps.com/global-objects.html#Memory-object
     */
    memory: SpawnMemory;
    /**
     * Spawn's name. You choose the name upon creating a new spawn, and it cannot
     * be changed later. This name is a hash key to access the spawn via the
     * `Game.spawns` object.
     */
    name: string;
    /**
     * If the spawn is in process of spawning a new creep, this object will contain the new creep’s information, or null otherwise.
     */
    spawning: Spawning | null;
    /**
     * A Store object that contains cargo of this structure.
     */
    store: Store<RESOURCE_ENERGY, false>;
}