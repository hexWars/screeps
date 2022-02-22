const p_creep = require('prototype_creep')
const p_room = require('prototype_room')
const p_source = require('prototype_source')


module.exports = function () {
	console.log('挂载拓展')
	p_creep();
	p_room();
	p_source();
}
