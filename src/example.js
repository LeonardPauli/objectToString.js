import {log} from './'

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
	longOneWithBreaks: 'Cras mattis consectetur purus sit amet fermentum.'
		+'\nFusce dapibus, tellus ac cursus commodo, tortor mauris'
		+'\nFusce dapibus, tellus ac cursus commodo, tortor mauris'
		+'\nFusce dapibus, tellus ac cursus commodo, tortor mauris',
	list: [7, 9, 't', ()=> 'do some'],
	myFun () { 'doSome' },
	t: new Thing(),
}

log(myObj)
