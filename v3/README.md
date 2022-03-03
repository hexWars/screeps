个人screeps代码
版本3.0
设计方案

# 宏观设计

要求:
- 以房间为单元进行配置且拥有独立的配置文件
- 内存存的尽可能少
- 多个spawn控制
- [动态(手动)调控,分布式检测数量](https://www.jianshu.com/p/d5e1a50473ce?utm_campaign=shakespeare&utm_content=note&utm_medium=seo_notes&utm_source=recommendation)
- 加上寻路升级代码
- flag表示资源点(外矿的位置)
- Link传输和脚下如果没有container自动造建筑
- 代码时间优化


# creep设计

去哪里,做什么
临界状态
去哪里,做什么

例子:
upgrader:
从资源点,取出能量
能量满了
去往controller,升级controller

## harvest

搬送到spawn
开始修建container
放入container

## upgrader

从资源点采集后升级
从container升级
从storage升级

## carrier

未出现storage,将能量传给spawn和extension和塔
出现storage,前面做完之后再传给storage

## builder
有建筑就去修
没有就升级||捡漏

## repairer
维修建筑和刷墙

## defender
发现敌人缓存后攻击,一个优先攻击最近的带攻击部件的敌人敌人

# structure设计

## tower设计
塔的逻辑改写
https://www.jianshu.com/p/c49fb24593b5
- 分析部件
- 不要进行重复搜索
- 缓存敌人信息

## link设计
- 传输到中央存储
- 进攻时传给防御塔(能量不足时传给其他建筑)

共三种link:能量link,中央link,防御(建筑)link
SourceLink--> CenterLink--> StructureLink

## container设计
creep进行采集时同时建造
进攻时分发拓展能量

## spawn设计
多个spawn分工,分工的解耦合

## wall和rampart

## road

自动修路

## flag

根据flag定位source和controller

