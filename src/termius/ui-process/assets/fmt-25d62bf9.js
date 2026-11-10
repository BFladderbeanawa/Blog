const e="Simple text formatter",t="fmt",n=[{name:"file",description:"File(s) to format",template:["filepaths"],isVariadic:!0,isOptional:!0}],s=[{description:`Center the text, line by line.  In this case, most of the other
options are ignored; no splitting or joining of lines is done`,name:"-c"},{description:`Try to format mail header lines contained in the input
sensibly`,name:"-m"},{description:"Format lines beginning with a ‘.’ (dot) character",name:"-n"},{description:`Allow indented paragraphs.  Without the -p flag, any change in
the amount of whitespace at the start of a line results in a
new paragraph being begun`,name:"-p"},{description:`Collapse whitespace inside lines, so that multiple whitespace
characters are turned into a single space.  (Or, at the end of
a sentence, a double space.)`,name:"-s"},{description:`Treat the chars (and no others) as sentence-ending characters.
By default the sentence-ending characters are full stop (‘.’),
question mark (‘?’) and exclamation mark (‘!’).  Remember that
some characters may need to be escaped to protect them from
your shell`,name:"-d",args:[{name:"chars",suggestions:[".","?","!"]}]},{description:`Replace multiple spaces with tabs at the start of each output
line, if possible.  Each number spaces will be replaced with
one tab.  The default is 8.  If number is 0, spaces are
preserved`,name:"-l",args:[{name:"number",suggestions:["8"]}]},{description:`Assume that the input files' tabs assume number spaces per tab
stop.  The default is 8`,name:"-t",args:[{name:"number",suggestions:["8"]}]}],a={optionsMustPrecedeArguments:!0},i={description:e,name:t,args:n,options:s,parserDirectives:a};export{n as args,i as default,e as description,t as name,s as options,a as parserDirectives};
//# sourceMappingURL=fmt-25d62bf9.js.map
