// string-from-object
// created by Leonard Pauli, 2017-2018
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


// stringFromObject
const stringFromObject = (obj, ...opts)=> {
	const defaultDepth = typeof opts[0]==='number'? opts.shift(): 1
	const opt = Object.assign({
		maxObjectStringLength: 100,
		indentation: '  ',
		filter: null, // ({key, value, name, enumerable, parent})=> true
		// changing:
		itemsToCollapse: [],
		prefix: '',
		parent: null,
		depth: defaultDepth,
		collapse: false,
	}, opts.shift() || {})

	// expand same object only once
	const isObject = typeof obj==='object'
	opt.collapse = isObject && opt.itemsToCollapse.indexOf(obj)>=0
	if (isObject && !opt.collapse) opt.itemsToCollapse.push(obj)

	const expandLimitReached = opt.depth==0 || !isObject || opt.collapse || !obj
	if (expandLimitReached) return valueFinal(obj, opt)

	const name = getObjectName(obj)
	const rest = fixForPropertyNames(obj, opt)
	return name + (rest.length? rest: ': {}')
}


const fixForPropertyNames = (obj, opt)=> {
	const {prefix, indentation, depth} = opt
	const keys = Object.keys(obj)
	return Object.getOwnPropertyNames(obj).map(k=> {
		const enumerable = keys.indexOf(k)>=0
		const parent = opt.parent || {value: obj, enumerable: true}
		const line = {key: k, value: obj[k], name, enumerable, parent}
		if (opt.filter && !opt.filter(line)) return ''

		const color = enumerable? 33+(depth%4): 2
		const content = stringFromObject(obj[k], depth-1, {...opt, parent: line, prefix: prefix+indentation})
		return `\n${prefix}\x1b[${color}m${k}: \x1b[0m${content}`
	}).join('')
}


// valueFinal
const valueFinal = (obj, opt)=>
	primitiveFix(obj)
	|| stringFix(obj, opt)
	|| functionFix(obj)
	|| voidOrNullFix(obj)
	|| objectFix(obj, opt)
	|| ''

const primitiveFix = o=> typeof o === 'number' || typeof o === 'boolean'
	? `\x1b[33m${o}\x1b[0m` : null

const stringFix = (o, {prefix})=> typeof o === 'string'
	? `\x1b[32m${o.replace(/\n/g, '\n'+prefix)}\x1b[0m` : null

const functionFix = o=> typeof o === 'function' ? (()=> {
	const regex = /function ?(.*) ?{ ?(return ?)?(.*?)(;})?$/ig
	const title = (o+'').split('\n')[0].replace(regex, (_, argsStr, ret, content, ended)=>
		`${argsStr}=> `+(ret?'':'{ ')+content+(ended?ret?'':' }':'...'))
	return `\x1b[36m${title}\x1b[0m`
})() : null

const voidOrNullFix = o=> typeof obj === 'undefined'
	? '\x1b[2mundefined\x1b[0m'
	: o === null ? '\x1b[2mnull\x1b[0m' : null

const objectFix = (obj, opt)=> {
	// if (typeof obj !== 'object') return null
	try {
		const name = getObjectName(obj)
		const str = (opt.collapse || name?'-> ':'') + (name || JSON.stringify(obj))
		return limitStr(opt.maxObjectStringLength)(str)
	} catch (err) {
		const str = (opt.collapse?'-> ':'') + String(obj)
		return limitStr(opt.maxObjectStringLength)(str)
	}
}


const getObjectName = o=> {
	const objOrFunc = typeof o == 'object' || typeof o == 'function'
	return (o.toString === [].toString && 'Array')
		|| (objOrFunc && typeof o.name == 'string' && o.name)
		|| (objOrFunc && o.constructor && typeof o.constructor.name == 'string' && o.constructor.name)
		|| (o.toString && o.toString())
		|| typeof o
}


const limitStr = n=> s=> s.length > n ? s.substr(0, n-3) + '...' : s


// export
export default stringFromObject
export const log = (obj, ...opts)=> {
	const depth = typeof opts[0]==='number'? opts.shift(): 5
	console.log(stringFromObject(obj, depth, opts.shift() || {}))
}
