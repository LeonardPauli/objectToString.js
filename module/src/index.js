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
		indentation: '\t',
		filter: null, // ({key, value, name, enumerable, parent})=> true
		colors: false,
		// changing:
		itemsToCollapse: [],
		prefix: '',
		parent: null,
		depth: defaultDepth,
		collapse: false,
	}, opts.shift() || {})
	const {colors} = opt
	opt.cw = opt.cw || (c=> s=> colors? colorWrap(c)(s): s)

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
		const content = stringFromObject(obj[k], {...opt, depth: depth-1, parent: line, prefix: prefix+indentation})
		return '\n' + prefix + opt.cw(color)(`${k}: `) + content
	}).join('')
}


// valueFinal
const valueFinal = (obj, opt)=>
	primitiveFix(obj, opt)
	|| stringFix(obj, opt)
	|| functionFix(obj, opt)
	|| voidOrNullFix(obj, opt)
	|| objectFix(obj, opt)
	|| ''

const primitiveFix = (o, {cw})=> typeof o === 'number' || typeof o === 'boolean'
	? cw(33)(String(o)) : null

const stringFix = (o, {prefix, cw})=> typeof o === 'string'
	? cw(32)(o.replace(/\n/g, '\n'+prefix)) : null

const functionFix = (o, {cw})=> typeof o === 'function'
	? cw(36)((o+'').split('\n')[0].replace(
		/function ?(.*) ?{ ?(return ?)?(.*?)(;})?$/ig,
		(_, argsStr, ret, content, ended)=>
			`${argsStr}=> `+(ret?'':'{ ')+content+(ended?ret?'':' }':'...')))
	: null

const voidOrNullFix = (o, {cw})=> typeof o === 'undefined'
	? cw(2)('undefined')
	: o === null ? cw(2)('null')
		: null

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
const colorWrap = (c = false)=> s=> c===false? s: `\x1b[${c}m${s}\x1b[0m`


// export
export default stringFromObject
export const log = (obj, ...opts)=> console.log(stringFromObject(obj, {
	indentation: '\t',
	colors: true,
	depth: typeof opts[0]==='number'? opts.shift(): 5,
	...opts.shift() || {}}
))
