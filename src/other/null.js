

module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------");
	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket);
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}
}
