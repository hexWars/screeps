interface CreepMemory {
    /**
     * 该 creep 的角色
     */
    role: string
    is_working?: boolean // 工作状态，区别于非工作状态

    source_roomName?: string // 外矿所在的房间名
    dest_roomName?: string // 采集资源的目的地

    // 外矿相关
    source_idx?: number // harvester.ts 存采集的source对应id的下标
    source_container_idx?: number
    container_pos_x?: number // 固定点取能量的creep的固定点，即container位置
    container_pos_y?: number
    link_harvester_pos_x?: number
    link_harvester_pos_y?: number
    reservation_tick?: number

    mine_idx?: number
    mine_type?
    path?

    dontPullMe?: boolean

    // transfer_start?:
    // transfer_type?:
    // transfer_dest?:

    // mine_idx?: number // mine.ts 暂未启用
    // soldier_room_flag?: number // soldier.ts 用于检查soldier出入房间状态 暂未启用

    energy_flag?: boolean
    move_to_lab_flag?: boolean
    help?: boolean // help flag, control if switch source automatic when source is empty.
    nuker_flag?: boolean
}

interface spawnQueue{
    push?: Function
    pop?: Function
    peek?: Function
    getLength?: Function
    clear?: Function

    data?: any
    priority?: any
    length?: any
}

interface RoomMemory {
    // 本房间内所有source的ID, 一旦扫描永远不会改变, 只需要判断undefined
    sources_num?: number
    sources_id?: Id<Source>[]
    sources_free_spaces?: RoomPosition[][]

    containers_num?: number
    containers_id?: Id<StructureContainer>[]
    links_num?: number
    links_id?: Id<StructureLink>[]

    towers_id?: Id<StructureTower>[]
    storage_id?: Id<StructureStorage>
    terminal_id?: Id<StructureTerminal>
    nuker_id?: Id<StructureNuker>

    spawnQueue?: spawnQueue
    check_spawn_queue_flag?: boolean

    // 对应不同source的harvester的个数，通常为1个
    // 对于3000能量的源, 只要有一个5WORK组件的creep在工作, 就能够保持最大效率
    source_harvester_states?: number[]
    source_harvester_num?: number[]
    source_transfer_states?: number[] // 对应不同source的transfer的个数
    source_transfer_num?: number[] // 对应不同source, transfer的限制个数

    check_containers_state?: boolean
    source_container_ids?: Id<StructureContainer>[] // 对应下标的source的container的ID

    check_links_state?: boolean
    source_link_ids?: Id<StructureLink>[]    
    link_harvester_pos_xs?: number[]
    link_harvester_pos_ys?: number[]

    mines_id?: Id<Mineral>[]

    source_distance?: number[]
    source_gets?: number[]
    source_costs?: number[]
    room_harvester_energy_total?: number

    auto_energy_mine?: boolean
    energy_mine_chain_ok?: boolean

    controller_id?: Id<StructureController>
    invader_core_id?: Id<StructureInvaderCore>

    war_flag?: boolean
    invader_died_tick?: number
    enemy_num?: number
    transfer_to_terminal?: number

    test_flag?: boolean
    restart_flag?: boolean
    
    claiming?: boolean
    check_energy_mine?: boolean
    spawning?: boolean
}

interface statsMemory{
    gcl?: number
    gclLevel?: number
    gpl?: number
    gplLevel?: number
    cpu?: number
    bucket?: number
}

interface Memory{
    showCost?: boolean
    stats?: statsMemory
}

interface spawnData{
    role?: string
    bodyParts?: BodyPartConstant[]
    name?: string
    memory?: CreepMemory
}

interface orderData{
    id?: string
    created?: number
    type?: string
    resourceType?: string
    roomName?: string
    amount?: number
    remainingAmount?: number
    price?: number
}

interface StructureSpawn{
    work: Function
    addTask: Function
    mainSpawn: Function
}

interface Room{
    spawnQueue?: spawnQueue;
    addSpawnTask?: Function
}

interface Memory{
    showCost?: boolean
}