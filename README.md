# string-from-object
*neatly formatted, indentation based presentation of js object, handles circular structures, depth levels, + logs with color*

__for usage, see [./module/\_\_tests\_\_](./module/__tests__)__
__`npm i string-from-object`__

```js
import {log} from 'string-from-object'
log({some: {object: ['or', 'value']}})

import strFromObj from 'string-from-object'
console.log(strFromObj(..., {
	depth: 1, indentation: '\t', colors: false,
	filter: ({key})=> key!=='name',
	nameExtractor: obj=> obj.name,
}))
```


### Contribute

Feel free to fork and send PR's :)

Copyright © Leonard Pauli, 2017-2018

Licence: GNU Affero General Public License v3.0 or later.
For commersial / closed-source / custom licencing needs, please contact us.
