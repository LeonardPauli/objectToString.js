// string-from-object
// tests/spec/examples
// Created by Leonard Pauli, 2018
// ---
// note: replace `sfo` with `log` anywhere to see result in console with neat colors :)

import {default as sfo, log} from 'string-from-object/src' // see note in $lpdocs/app/js/testing


// TODO: make sure it actually is an array index or from iterator/set/etc?
// log({
// 	'-20': 'some',
// 	'5': 'lall',
// 	'>': 'value',
// })

// TODO: a should log [], not {}
// log({a: [], b: {}})


// TODO: null should be "null", not "undefined"
// TODO: test for large arrays
// TODO: test for regex rendering (+ lastIndex hide if 0) (implemented but not tested)
// TODO: prefer unfolding on less depth, eg. {a: {b: {...}}, b: {...}} -> {a: {b: -> Obj}, b: {...}}
// TODO: instead of just showing "-> Object", record path where it is unfolded "-> key.some.path"
// 	(or -> Object...) if folded without any unfolded entries (max depth)


describe('log', ()=> {
	it('example', ()=> {
		class Thing {
			prop = 'value'
		}

		const o = {
			name: 'theO',
			value: 3,
			likeIt: true,
			message: 'hello',
			// eslint-disable-next-line max-len
			longOne: 'Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Sed posuere consectetur est at lobortis. Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit.',
			longOneWithBreaks: 'Cras mattis consectetur purus sit amet fermentum.'
				+ '\nFusce dapibus, tellus ac cursus commodo, tortor mauris'
				+ '\nFusce dapibus, tellus ac cursus commodo, tortor mauris'
				+ '\nFusce dapibus, tellus ac cursus commodo, tortor mauris',
			list: [7, 9, 't', ()=> 'do some'],
			myFun () { this.a = 'do some' },
			t: new Thing(),
		}

		expect(sfo(o, 5, {singlelineLengthMax: 0, listItemIndicator: false, listItemIndicatorIndex: true})).toBe(`theO
value: 3
likeIt: true
message: "hello"
longOne: "Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Sed posuere consectetur est at lobortis. Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit."
longOneWithBreaks: "Cras mattis consectetur purus sit amet fermentum.
	Fusce dapibus, tellus ac cursus commodo, tortor mauris
	Fusce dapibus, tellus ac cursus commodo, tortor mauris
	Fusce dapibus, tellus ac cursus commodo, tortor mauris"
list: Array
	0: 7
	1: 9
	2: "t"
	3: () => 'do some'
myFun: myFun() => { this.a = 'do some' }
t: Thing
	prop: "value"`)
	})
})

describe('raw', ()=> {

	it('basic', ()=> {
		const o = {
			primitiveInt: 0,
			primitiveFloat: 12.1234567,
			primitiveTrue: true,
			primitiveFalse: false,
			string: 'hello',
			functionDouble: x=> x*2,
			voidOrNullUndefined: undefined,
			voidOrNullVoid: void 0,
			voidOrNullNull: null,
			objectEmpty: {},
		}
		expect(sfo(o)).toBe(`Object
primitiveInt: 0
primitiveFloat: 12.1234567
primitiveTrue: true
primitiveFalse: false
string: "hello"
functionDouble: functionDouble(x) => x * 2
voidOrNullUndefined: undefined
voidOrNullVoid: undefined
voidOrNullNull: null
objectEmpty: -> Object`)
	})

	it('depth', ()=> {
		const o = {lvl: 0, o: {lvl: 1, o: {lvl: 2, o: {lvl: 3, o: {lvl: 4, o: {lvl: 5, o: null}}}}}}
		expect(sfo(o, {depth: 2, singlelineLengthMax: 0})).toBe(`Object
lvl: 0
o: Object
	lvl: 1
	o: -> Object`)
		expect(sfo(o, {depth: 3, singlelineLengthMax: 0})).toBe(`Object
lvl: 0
o: Object
	lvl: 1
	o: Object
		lvl: 2
		o: -> Object`)
	})

	it('repeating + name', ()=> {
		const color = {name: 'Red', hex: '#ff0000'}
		const o = {first: {color}, second: {color}}
		expect(sfo(o, 5, {singlelineLengthMax: 0})).toBe(`Object
first: Object
	color: Red
		hex: "#ff0000"
second: Object
	color: -> Red`)
	})

	it('circular', ()=> {
		const erik = {name: 'Erik'}
		const anna = {name: 'Anna', friend: erik}
		erik.friend = anna
		const o = {erik, anna}
		expect(sfo(o, 5, {singlelineLengthMax: 0})).toBe(`Object
erik: Erik
	friend: Anna
		friend: -> Erik
anna: -> Anna`)
	})

	it('name from class', ()=> {
		class MyThing {}
		const o = {value: new MyThing()}
		expect(sfo(o, 5, {singlelineLengthMax: 0})).toBe(`Object
value: MyThing`)
	})

	it('custom nameExtractor', ()=> {
		const o = {value: {'<class>': 'MyThing', name: 'something else'}}
		// though will take name if nameExtractor returns null?
		const defaultNameField = '<class>'
		expect(sfo(o, 5, {
			singlelineLengthMax: 0,
			nameExtractor: o=> o && o[defaultNameField],
			// filter: ({key, value, name})=> !(key===defaultNameField && name === value),
			filter: ({key, value, name})=> true,
		})).toBe(`Object
value: MyThing
	<class>: "MyThing"
	name: "something else"`)
	})

	it('folding (singlelineLengthMax)', ()=> {
		const arr = ['a', 'b']
		arr.someProp = 'test'
		const arr2 = ['a', 'b']
		arr2.someProp = 'test'
		arr2.someMore = 'value'
		const arr3 = ['a', 'b']
		arr3.someProp = 'test'
		arr3.someMore = 'value'
		arr3.manyMore = 156
		const o = [
			{a: {value: 'some', more: {value: 'some', more: {value: 'some'}}}},
			{a: []},
			1231,
			'string',
			[],
			arr,
			arr2,
			arr3,
			{some: [1, 2, 4]},
		]
		expect(sfo(o, 5, {singlelineLengthMax: 50})).toBe(`Array
- Object
	a: Object
		value: "some"
		more: { value: "some", more: { value: "some" } }
- { a: [] }
- 1231
- "string"
- []
- { someProp: "test" }[ "a", "b" ]
- { someProp: "test", someMore: "value" }
	- "a"
	- "b"
- [ "a", "b" ]
	someProp: "test"
	someMore: "value"
	manyMore: 156
- { some: [ 1, 2, 4 ] }`)
	})

})
