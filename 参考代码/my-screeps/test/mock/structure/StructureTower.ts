
/**
 * Remotely attacks or heals creeps, or repairs structures. Can be targeted to
 * any object in the room. However, its effectiveness highly depends on the
 * distance. Each action consumes energy.
 */
 export default class StructureTower {
    readonly prototype: StructureTower;

    /**
     * The amount of energy containing in this structure.
     * @deprecated An alias for .store[RESOURCE_ENERGY].
     */
    energy: number;
    /**
     * The total amount of energy this structure can contain.
     * @deprecated An alias for .store.getCapacity(RESOURCE_ENERGY).
     */
    energyCapacity: number;
    /**
     * A Store object that contains cargo of this structure.
     */
    store: Store<RESOURCE_ENERGY, false>;

}