
global.structuresShape= {
    "spawn": "◎",
    "extension": "ⓔ",
    "link": "◈",
    "road": "•",
    "constructedWall": "▓",
    "rampart": "⊙",
    "storage": "▤",
    "tower": "🔫",
    "observer": "👀",
    "powerSpawn": "❂",
    "extractor": "⇌",
    "terminal": "✡",
    "lab": "☢",
    "container": "□",
    "nuker": "▲",
    "factory": "☭"
}
global.structuresColor= {
    "spawn": "cyan",
    "extension": "#0bb118",
    "link": "yellow",
    "road": "#fa6f6f",
    "constructedWall": "#003fff",
    "rampart": "#003fff",
    "storage": "yellow",
    "tower": "cyan",
    "observer": "yellow",
    "powerSpawn": "cyan",
    "extractor": "cyan",
    "terminal": "yellow",
    "lab": "#d500ff",
    "container": "yellow",
    "nuker": "cyan",
    "factory": "yellow"
}
pro={
    //线性同余随机数
    rnd : function( seed ){
    return ( seed * 9301 + 49297 ) % 233280; //为何使用这三个数?
    },
    // seed 的随机颜色
    randomColor : function (seed){
        seed = parseInt(seed)
        let str = "12334567890ABCDEF"
        let out = "#"
        for(let i=0;i<6;i++){
            seed = pro.rnd(seed+Game.time%100)
            out+=str[parseInt(seed)%str.length]
        }
        return out
    },
    // 大概消耗1 CPU！ 慎用！
    showRoomStructures : function (roomName,structMap){
        let roomStructs = new RoomArray().init()
        const visual = new RoomVisual(roomName);
        structMap["road"].forEach(e=>roomStructs.set(e[0],e[1],"road"))
        _.keys(CONTROLLER_STRUCTURES).forEach(struct=>{
            if(struct=="road"){
                structMap[struct].forEach(e=>{
                    roomStructs.forNear((x,y,val)=>{
                        if(val =="road"&&((e[0]>=x&&e[1]>=y)||(e[0]>x&&e[1]<y)))visual.line(x,y,e[0],e[1],{color:structuresColor[struct]})
                    },e[0],e[1]);
                    visual.text(structuresShape[struct], e[0],e[1]+0.25, {color: structuresColor[struct],opacity:0.75,fontSize: 7})
                })
            }
            else structMap[struct].forEach(e=>visual.text(structuresShape[struct], e[0],e[1]+0.25, {color: structuresColor[struct],opacity:0.75,fontSize: 7}))
        })
    },
}

global.HelperVisual=pro