// stringFromObject
// created by Leonard Pauli, 2017
//

// colors
// const c = (()=> {
// 	const v = {
// 		endfg: 39,
// 		endbg: 49,
// 	}
// 	'krgybmcw'.split('').map((k, i)=> v['_'+k] = 10+(v[k] = 30+i))
// 	'reset,bold,dim,italic,underscore,,,inverse,hidden,strike'.split(',')
// 		.map((k, i)=> v['end'+k] = 20+(v[k] = i))
// 	const c = {}
// 	Object.keys(v).forEach(k=> c[k] = `\x1b[${v[k]}m`)
// 	return c
// })()


// stringFromObject; similar to console.dir, although more rim/yaml-like
const stringFromObject = (obj, depth=1, options={}, prefix='')=> {
	const opt = Object.assign({
		keepCollapsed: [],
		maxObjectStringLength: 100,
		indentation: '  ',
	}, options)
	const {indentation, maxObjectStringLength} = opt

	// only same object expand once
	const isObject = typeof obj==='object'
	const keepCollapsed = isObject && opt.keepCollapsed.indexOf(obj)>=0
	if (isObject && !keepCollapsed) opt.keepCollapsed.push(obj)

	// render object name
	const getObjectName = obj=> {
		if (obj.toString === [].toString) return 'Array'
		const objOrFunc = typeof obj == 'object' || typeof obj == 'function'
		const objStr
			= (objOrFunc && typeof obj.name == 'string' && obj.name)
			|| (objOrFunc && objOrFunc.constructor
				&& typeof obj.constructor.name == 'string'
				&& obj.constructor.name)
			|| (obj.toString && obj.toString())
			|| typeof obj
		return objStr
		// const useObjStr = objStr!=='[object Object]'
		// return useObjStr? objStr.replace(/\n(.| |\n)*$/, '...'): null
	}

	// when value shouldn't be futher expanded
	if (depth==0 || !isObject || keepCollapsed || !obj) {

		// primitive
		if (typeof obj === 'number' || typeof obj === 'boolean')
			return `\x1b[33m${obj}\x1b[0m`

		// string
		if (typeof obj === 'string')
			return `\x1b[32m${obj.replace(/\n/g, '\n'+prefix)}\x1b[0m`

		// function
		if (typeof obj === 'function') {
			const regex = /function ?(.*) ?{ ?(return ?)?(.*?)(;})?$/ig
			const title = (obj+'').split('\n')[0].replace(regex, (_, argsStr, ret, content, ended)=>
				`${argsStr}=> `+(ret?'':'{ ')+content+(ended?ret?'':' }':'...'))
			return `\x1b[36m${title}\x1b[0m`
		}

		// undefined or null
		if (typeof obj === 'undefined')
			return '\x1b[2mundefined\x1b[0m'
		if (obj === null)
			return '\x1b[2mnull\x1b[0m'

		// othervise; object
		try {
			const name = getObjectName(obj)
			const str = (keepCollapsed || name?'-> ':'')
				+ (name || JSON.stringify(obj))
			if (str.length>maxObjectStringLength)
				return str.substr(0, maxObjectStringLength-3)+'...'
			return str
		} catch (err) {
			return (keepCollapsed?'-> ':'')+obj
		}
	}

	// if value might be futher expanded
	const keys = Object.keys(obj)
	const propertyNames = Object.getOwnPropertyNames(obj)
	if (!propertyNames.length) return '{}'
	const name = getObjectName(obj)

	return (name || '')+propertyNames.map(k=> {
		const color = keys.indexOf(k)==-1? 2: 33+(depth%4)
		const content = stringFromObject(obj[k], depth-1, opt, prefix+indentation)
		return `\n${prefix}\x1b[${color}m${k}: \x1b[0m${content}`
	}).join('')
}

export default stringFromObject
export const log = (obj, depth=5, opt)=> console.log(stringFromObject(obj, depth, opt))
