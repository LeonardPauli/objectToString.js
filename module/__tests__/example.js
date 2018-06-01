// string-from-object
// tests/spec/examples
// Created by Leonard Pauli, 2018
// ---
// note: replace `sfo` with `log` anywhere to see result in console with neat colors :)

import {default as sfo, log} from 'string-from-object/src' // see note in $lpdocs/app/js/testing


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
			longOneWithBreaks: 'Cras mattis consectetur purus sit amet fermentum.'+
				'\nFusce dapibus, tellus ac cursus commodo, tortor mauris'+
				'\nFusce dapibus, tellus ac cursus commodo, tortor mauris'+
				'\nFusce dapibus, tellus ac cursus commodo, tortor mauris',
			list: [7, 9, 't', ()=> 'do some'],
			myFun () { 'doSome' },
			t: new Thing(),
		}

		expect(sfo(o, 5)).toBe(`theO
name: theO
value: 3
likeIt: true
message: hello
longOne: Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Sed posuere consectetur est at lobortis. Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nullam id dolor id nibh ultricies vehicula ut id elit.
longOneWithBreaks: Cras mattis consectetur purus sit amet fermentum.
	Fusce dapibus, tellus ac cursus commodo, tortor mauris
	Fusce dapibus, tellus ac cursus commodo, tortor mauris
	Fusce dapibus, tellus ac cursus commodo, tortor mauris
list: Array
	0: 7
	1: 9
	2: t
	3: () => { ...
	length: 4
myFun: myFun() => { ...
t: Thing
	prop: value`)
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
string: hello
functionDouble: functionDouble(x) => { ...
voidOrNullUndefined: undefined
voidOrNullVoid: undefined
voidOrNullNull: null
objectEmpty: -> Object`)
	})

	it('depth', ()=> {
		const o = {lvl: 0, o: {lvl: 1, o: {lvl: 2, o: {lvl: 3, o: {lvl: 4, o: {lvl: 5, o: null}}}}}}
		expect(sfo(o, {depth: 2})).toBe(`Object
lvl: 0
o: Object
	lvl: 1
	o: -> Object`)
		expect(sfo(o, {depth: 3})).toBe(`Object
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
		expect(sfo(o, 5)).toBe(`Object
first: Object
	color: Red
		name: Red
		hex: #ff0000
second: Object
	color: -> Red`)
	})

	it('circular', ()=> {
		const erik = {name: 'Erik'}
		const anna = {name: 'Anna', friend: erik}
		erik.friend = anna
		const o = {erik, anna}
		expect(sfo(o, 5)).toBe(`Object
erik: Erik
	name: Erik
	friend: Anna
		name: Anna
		friend: -> Erik
anna: -> Anna`)
	})

})
