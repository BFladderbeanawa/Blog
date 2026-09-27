const e="Fold long lines for finite width output device",t="fold",i=[{name:"file",description:"File(s) to fold",template:["filepaths"],isVariadic:!0,isOptional:!0}],s=[{description:"Count width in bytes rather than column positions",name:"-b"},{description:`Fold line after the last blank character within the first width
column positions (or bytes)`,name:"-s"},{description:`Specify a line width to use instead of the default 80 columns.
The width value should be a multiple of 8 if tabs are present,
or the tabs should be expanded using expand(1) before using
fold`,name:"-w",args:[{name:"width",suggestions:["80","90","100","110","120"]}]}],n={optionsMustPrecedeArguments:!0},o={description:e,name:t,args:i,options:s,parserDirectives:n};export{i as args,o as default,e as description,t as name,s as options,n as parserDirectives};
//# sourceMappingURL=fold-43f2c90e.js.map
