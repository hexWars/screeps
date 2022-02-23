/**
 *
 * 使用方法再 main 最后面输入
 * HelperCpuUsed.exec()
 * 一键呼出图标
 * HelperCpuUsed.show()
 *
 *
 */
global.cpuEcharts=(divName,data,data2)=>{
return `
<div id="${divName}" style="height: 400px;width:1200px;color:#000"/>
<script>
eval($.ajax({url:"https://cdn.jsdelivr.net/npm/echarts@5/v1/echarts.min.js",async:false}).responseText);
function showCpuUsed(divName,data,data2){
var chartDom = document.getElementById(divName);
var myChart = echarts.init(chartDom, 'dark');

data = data.map(e=>e>0?e:0);
if(data[0]>data[data.length-1]*1.3){
    data = data.slice(1);
    data2 = data2.slice(1);
}

var option = {
  xAxis: {
    type: 'category'
  },
  yAxis: {
    type: 'value'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false
    }
  },
  yAxis: [
    {
      name: 'cpuUsed',
      type: 'value'
    },
    {
      name: 'bucket',
      max: 10000,
      min:0,
      type: 'value'
    }
  ],
  dataZoom: [
    {
      show: true
    }
  ],
  animation:false,
  series: [
    {
      data: data,
      type: 'line'
    },
    {
      data: data2,
      yAxisIndex: 1,
      type: 'line'
    }
  ]
};

option.backgroundColor= '#2b2b2b';
myChart.setOption(option);
};
var data = ${JSON.stringify(data)};
var data2 = ${JSON.stringify(data2)};
showCpuUsed('${divName}',data,data2)
</script>
`.replace(/[\r\n]/g, "")
// .replace("script>","c>")
}
    // smooth: true,
// step: 'middle',

let pro={
    show(){
        console.log(cpuEcharts(Game.time,pro.cpu.slice(-10000),pro.bucket.slice(-10000)))
    },
    cpu:[],
    bucket:[],
    exec (){
        if(pro.cpu.length>20000)pro.cpu = pro.cpu.slice(-10000)
        if(pro.bucket.length>20000)pro.cpu = pro.bucket.slice(-10000)
        pro.cpu.push(Game.cpu.getUsed());
        pro.bucket.push(Game.cpu.bucket);
    }
}

let HelperCpuUsed = pro;

module.exports = {
  HelperCpuUsed
}

// if(cpu15t.length==15){
//     let avg = 0;
//     let pow2 = 0;
//     let pow3 = 0;
//     let max = cpu15t[0]
//     let min = cpu15t[0]
//     for(let i=0;i<15;i++){
//         let num = cpu15t[i];
//         max = Math.max(max,num)
//         min = Math.min(min,num)
//         avg += num;
//         pow2 += num*num;
//         pow3 += num*num*num;
//     }
//     avg/=15
//     pow2/=15
//     pow3/=15
//     let sigma = Math.sqrt(pow2 - avg*avg)
//     let skew = (pow3 - 3*avg*sigma*sigma - avg*avg*avg)/(sigma*sigma*sigma)
//     log(max,min,avg,sigma,skew)
