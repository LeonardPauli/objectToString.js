import {default as sfo, log} from 'string-from-object/src' // see note in $lpdocs/app/js/testing

describe('log', ()=> {
	it('example', ()=> {
		class Thing {
			prop = 'value'
		}

		const myObj = {
			name: 'thing',
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

		log(myObj)
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
		expect(sfo(o, 1, {colors: false})).toBe(`Object
primitiveInt: 0
primitiveFloat: 12.1234567
primitiveTrue: true
primitiveFalse: false
string: hello
functionDouble: functionDouble(x) => { ...
voidOrNullUndefined: undefined
voidOrNullVoid: undefined
voidOrNullNull: null
objectEmpty: Object: {}`)
	})
	it('simple', ()=> {
		const o = {lvl: 0, o: {lvl: 1, o: {lvl: 2, o: {lvl: 3, o: null}}}}
		expect(sfo(o, 1)).toBe(`lvl`)
	})
	// it('depth', ()=> {

	// })
})
