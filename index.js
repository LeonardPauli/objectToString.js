Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};
var stringFromObject=function stringFromObject(obj){var depth=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};var prefix=arguments.length>3&&arguments[3]!==undefined?arguments[3]:'';
var opt=_extends({
keepCollapsed:[],
maxObjectStringLength:100,
indentation:'  '},
options);var
indentation=opt.indentation,maxObjectStringLength=opt.maxObjectStringLength;


var isObject=typeof obj==='object';
var keepCollapsed=isObject&&opt.keepCollapsed.indexOf(obj)>=0;
if(isObject&&!keepCollapsed)opt.keepCollapsed.push(obj);


var getObjectName=function getObjectName(obj){
if(obj.toString===[].toString)return'Array';
var objOrFunc=typeof obj=='object'||typeof obj=='function';
var objStr=
objOrFunc&&typeof obj.name=='string'&&obj.name||
objOrFunc&&objOrFunc.constructor&&typeof obj.constructor.name=='string'&&obj.constructor.name||
obj.toString&&obj.toString()||
typeof obj;
return objStr;


};


if(depth==0||!isObject||keepCollapsed||!obj){


if(typeof obj==='number'||typeof obj==='boolean')
return'\x1B[33m'+obj+'\x1B[0m';


if(typeof obj==='string')
return'\x1B[32m'+obj.replace(/\n/g,'\n'+prefix)+'\x1B[0m';


if(typeof obj==='function')
return'\x1B[36m'+(obj+'').split('\n')[0].replace(/function ?(.*) ?{ ?(return ?)?(.*?)(;})?$/ig,
function(_,argsStr,ret,content,ended){return argsStr+'=> '+(ret?'':'{ ')+content+(ended?ret?'':' }':'...');})+'\x1B[0m';


if(typeof obj==='undefined')
return'\x1b[37mundefined\x1b[0m';
if(obj===null)
return'\x1b[37mnull\x1b[0m';


try{
var _name=getObjectName(obj);
var str=(keepCollapsed||_name?'-> ':'')+(
_name||JSON.stringify(obj));
if(str.length>maxObjectStringLength)
return str.substr(0,maxObjectStringLength-3)+'...';
return str;
}catch(err){
return(keepCollapsed?'-> ':'')+obj;
}
}


var keys=Object.keys(obj);
if(!keys.length)return'{}';
var name=getObjectName(obj);

return(name||'')+keys.map(function(k){return'\n'+prefix+'\x1B['+(33+depth%4)+'m'+k+': \x1B[0m'+
stringFromObject(obj[k],depth-1,opt,prefix+indentation);}).
join('');
};exports.default=

stringFromObject;
var log=exports.log=function log(obj){var depth=arguments.length>1&&arguments[1]!==undefined?arguments[1]:5;var opt=arguments[2];return console.log(stringFromObject(obj,depth,opt));};
