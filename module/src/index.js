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
	const defaultNameField = 'name'
	const opt = Object.assign({
		maxObjectStringLength: 100,
		singlelineLengthMax: 60,
		functionsFull: false,
		listItemIndicator: true,
		listItemIndicatorIndex: 10, // true | false | minNr
		indentation: '\t',
		alignValuesLeftColumnMinWidth: 0, // eg. 40 to enforce min left column char width
		
		filter: ({key, value, name, enumerable, parent})=> !(key===defaultNameField && name === value),
		nameExtractor: o=> {
			const objOrFunc = typeof o === 'object' || typeof o === 'function'
			return objOrFunc && typeof o[defaultNameField] === 'string' && o[defaultNameField]
		},

		colors: false,
		// changing:
		itemsToCollapse: [],
		prefix: '',
		parent: null,
		depth: defaultDepth,
		collapse: false,
	}, opts.shift() || {})
	opt.depthOrg = opt.depthOrg || opt.depth
	const {colors} = opt
	opt.cw = opt.cw || (c=> s=> colors? colorWrap(c)(s): s)
	opt.cwStrip = s=> s.replace(/\u001b\[.*?m/g, '')

	// expand same object only once
	const isObject = typeof obj==='object'
	opt.collapse = isObject && opt.itemsToCollapse.indexOf(obj)>=0
	if (isObject && !opt.collapse) opt.itemsToCollapse.push(obj)

	const expandLimitReached = opt.depth==0 || !isObject || opt.collapse || !obj
	if (expandLimitReached) return valueFinal(obj, opt)

	return getFinalObjText(obj, opt)
}

const getFinalObjText = (obj, opt)=> {
	const name = getObjectName(obj, opt)
	const {singleLine, lines} = fixForPropertyNames(obj, opt, opt.cwStrip(name))
	const nameLimited = limitStr(opt.maxObjectStringLength)(name.replace(/(\n|\t| )+/g, ' '))
	const useSingleline = singleLine.length
	const linesStr = lines.length? '\n'+lines.join('\n'): ''
	const noContent = singleLine.length + linesStr.length === 0
	if (noContent && nameLimited==='Object') return opt.cw(2)('{}')
	if (noContent && nameLimited==='Array') return opt.cw(2)('[]')
	const nameNode = ['Object', 'Array'].includes(nameLimited)
	const nameSkip = nameNode && useSingleline
	const isRegex = obj && obj instanceof RegExp
	const title = isRegex ? opt.cw(c.c.d)(obj.toString())
		: nameSkip ? ''
		: nameNode ? opt.cw(2)(name)
		: name
	return title + singleLine + linesStr
}

// eslint-disable-next-line no-new-wrappers
const c = 'nrgybpcw'.split('').reduce((o, k, i)=> ((o[k] = new Number(90+i)).d = 30+i, o), {})

const fixForPropertyNames = (obj, opt, name)=> {
	const {
		prefix, indentation, depthOrg, depth,
		singlelineLengthMax, listItemIndicator, listItemIndicatorIndex,
	} = opt
	const keys = Object.keys(obj)
	const propNames = Object.getOwnPropertyNames(obj)

	const lines = propNames.map(k=> {
		const enumerable = keys.indexOf(k)>=0
		const parent = opt.parent || {value: obj, enumerable: true}
		const line = {key: k, value: obj[k], name, enumerable, parent}
		if (opt.filter && !opt.filter(line)) return null

		const color = enumerable? [c.b, c.p.d, c.b, c.p][(depthOrg-depth)%4]: 2
		const content = stringFromObject(obj[k], {...opt, depth: depth-1, parent: line, prefix: prefix+indentation})
		// TODO: get indices separately from array keys to be sure?
		const isListItem = enumerable && parseInt(k, 10)+''===k
		return {isListItem, k, color, content}
	}).filter(Boolean)

	const li = lines.filter(({isListItem})=> isListItem)
	if (Array.isArray(obj) && obj.length===li.length)
		lines.splice(lines.findIndex(({k})=> k==='length'), 1)
	const isRegex = obj && obj instanceof RegExp
	if (isRegex && obj.lastIndex===0)
		lines.splice(lines.findIndex(({k})=> k==='lastIndex'), 1)
	const ni = lines.filter(({isListItem})=> !isListItem)

	const niSingleLine = ni
		.map(({k, color, content})=> opt.cw(color)(k)+opt.cw(2)(': ')+content)
		.join(opt.cw(2)(', '))
	const liSingleLine = li
		.map(({k, content}, i)=> (parseInt(k, 10)===i?'':opt.cw(c.c)(`${listItemIndicator?'- ':''}${k}`)+opt.cw(2)(': '))+content)
		.join(opt.cw(2)(', '))

	const niw = niSingleLine?`${opt.cw(2)('{')} ${niSingleLine} ${opt.cw(2)('}')}`:''
	const liw = liSingleLine?`${opt.cw(2)('[')} ${liSingleLine} ${opt.cw(2)(']')}`:''
	const nic = opt.cwStrip(niw).length
	const lic = opt.cwStrip(liw).length
	const niu = !niw.includes('\n') && nic < singlelineLengthMax
	const liu = !liw.includes('\n') && lic < singlelineLengthMax - (niu?nic:0)

	const linesParts = lines.filter(({isListItem})=> isListItem?!liu:!niu)
		.map(({isListItem, k, color, content,
			listItemIndicatorIndexShow = isListItem && (listItemIndicatorIndex===true || (
				listItemIndicatorIndex!==false && parseInt(k, 10) >= listItemIndicatorIndex)),
		}, i)=> [prefix + (isListItem
			? opt.cw(c.c)(`${listItemIndicator?'- ':''}${listItemIndicatorIndexShow?k:''}`)
			: opt.cw(color)(k)
		) + opt.cw(2)(isListItem&&!listItemIndicatorIndexShow?'':': '), content])

	const linesLeftMaxLength = opt.alignValuesLeftColumnMinWidth
	// TODO: option to use automatic?
	// 	linesParts.map(([s])=> s.length).reduce((a, b)=> Math.max(a, b), 0)

	return {
		singleLine: (niu?niw:'')+(liu?liw:''),
		lines: linesLeftMaxLength
			// TODO: should probably use cwStrip to get correct
			? linesParts.map(([l, r])=> strpadr(l, linesLeftMaxLength, ' ')+r)
			: linesParts.map(([l, r])=> l+r),
	}
}

const range = n=> Array(Math.max(n || 0, 0)).fill().map((_, i)=> i)
const strpadr = (s, n, c)=> s+range(n - s.length).map(_=> c).join('')


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
	? cw(2)('"') + cw(32)(o.replace(/\n/g, '\n'+prefix)) + cw(2)('"'): null

const functionFix = (o, {cw, functionsFull})=> typeof o === 'function'
	? cw(36)(functionsFull?o+'':(o+'')
		.replace('\n', '')
		.replace(/\n[\t ]*}$/, '}')
		.split('\n')[0].replace(/[\t ]+/g, ' ')
		// .replace(/.*/, _=> console.log(_) || _)
		.replace(/function ?(.*) ?{ ?(return ?)?(.*?)(;})?$/ig,
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
		const name = getObjectName(obj, opt)
		const str = (opt.collapse || name?'-> ':'') + (name || JSON.stringify(obj))
		return limitStr(opt.maxObjectStringLength)(str)
	} catch (err) {
		const str = (opt.collapse?'-> ':'') + String(obj)
		return limitStr(opt.maxObjectStringLength)(str)
	}
}


const getObjectName = (o, {nameExtractor, cw} = {})=> {
	const objOrFunc = typeof o == 'object' || typeof o == 'function'
	const nameExtracted = nameExtractor && nameExtractor(o)
	return (nameExtracted && cw(c.w)(nameExtracted))
		|| (typeof o === 'symbol' && o.toString() && `Symbol(${cw(c.w)(o.toString().replace(/^Symbol\((.*)\)$/g, '$1'))})`)
		|| (o.toString === [].toString && 'Array')
		|| (objOrFunc && o.constructor && typeof o.constructor.name == 'string' && o.constructor.name)
		|| (o.toString && o.toString())
		|| typeof o
}


const limitStr = n=> s=> s.length > n ? s.substr(0, n-3) + '...' : s
const colorWrap = (c = false)=> s=> c===false? s: `\x1b[${c}m${s}\x1b[0m`


// export
export default stringFromObject

export const custom = optsDefault=> (obj, ...opts)=> stringFromObject(obj, {
	...optsDefault,
	depth: typeof opts[0]==='number'? opts.shift(): optsDefault.depth || 5,
	...opts.shift() || {}})

export const log = (obj, ...opts)=> console.log(custom({
	indentation: '  ', colors: true,
})(obj, ...opts))
