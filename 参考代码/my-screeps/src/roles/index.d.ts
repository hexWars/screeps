interface CreepMemory {
    /**
     * 该 creep 的角色
     */
    role?: string
    /**
     * 该Creep是否在执行升级操作
     */
    upgrading?:boolean
    /**
     * 该Creep是否在执行建造操作
     */
    building?:boolean
    /**
     * 是否正在工作
     */
    working?:boolean
}