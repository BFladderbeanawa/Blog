const e="Compare files line by line",n="diff",i=[{name:"file",template:["filepaths"],isVariadic:!0}],t=[{description:"Ignore case differences in file contents",name:["-i","--ignore-case"]},{description:"Ignore case when comparing file names",name:"--ignore-file-name-case"},{description:"Consider case when comparing file names",name:"--no-ignore-file-name-case"},{description:"Ignore changes due to tab expansion",name:["-E","--ignore-tab-expansion"]},{description:"Ignore changes in the amount of white space",name:["-b","--ignore-space-change"]},{description:"Ignore all white space",name:["-w","--ignore-all-space"]},{description:"Ignore changes whose lines are all blank",name:["-B","--ignore-blank-lines"]},{description:"Ignore changes whose lines all match RE",name:["-I","--ignore-matching-lines"],args:[{name:"RE"}]},{description:"Strip trailing carriage return on input",name:"--strip-trailing-cr"},{description:"Treat all files as text",name:["-a","--text"]},{description:"Output NUM lines of copied context",name:["-c","-C","--context"],args:[{name:"NUM"}]},{description:"Output NUM lines of unified context",name:["-u","-U","--unified"],args:[{name:"NUM"}]},{description:"Use LABEL instead of file name",name:"--label",args:[{name:"LABEL"}]},{description:"Show which C function each change is in",name:["-p","--show-c-function"]},{description:"Show the most recent line matching RE",name:["-F","--show-function-line"],args:[{name:"RE"}]},{description:"Output only whether files differ",name:["-q","--brief"]},{description:"Output an ed script",name:["-e","--ed"]},{description:"Output a normal diff",name:"--normal"},{description:"Output an RCS format diff",name:["-n","--rcs"]},{description:"Output in two columns",name:["-y","--side-by-side"]},{description:"Output at most NUM (default 130) print columns",name:["-W","--width"],args:[{name:"NUM"}]},{description:"Output only the left column of common lines",name:"--left-column"},{description:"Do not output common lines",name:"--suppress-common-lines"},{description:"Output merged file to show `#ifdef NAME' diffs",name:["-D","--ifdef"],args:[{name:"NAME"}]},{description:"Pass the output through `pr' to paginate it",name:["-l","--paginate"]},{description:"Expand tabs to spaces in output",name:["-t","--expand-tabs"]},{description:"Make tabs line up by prepending a tab",name:["-T","--initial-tab"]},{description:"Recursively compare any subdirectories found",name:["-r","--recursive"]},{description:"Treat absent files as empty",name:["-N","--new-file"]},{description:"Treat absent first files as empty",name:"--unidirectional-new-file"},{description:"Report when two files are the same",name:["-s","--report-identical-files"]},{description:"Exclude files that match PAT",name:["-x","--exclude"],args:[{name:"PAT"}]},{description:"Exclude files that match any pattern in FILE",name:["-X","--exclude-from"],args:[{name:"FILE",template:["filepaths"]}]},{description:"Start with FILE when comparing directories",name:["-S","--starting-file"],args:[{name:"FILE",template:["filepaths"]}]},{description:"Compare FILE1 to all operands. FILE1 can be a directory",name:"--from-file",args:[{name:"FILE1",template:["filepaths","folders"]}]},{description:"Compare all operands to FILE2. FILE2 can be a directory",name:"--to-file",args:[{name:"FILE2",template:["filepaths","folders"]}]},{description:"Keep NUM lines of the common prefix and suffix",name:"--horizon-lines",args:[{name:"NUM"}]},{description:"Try hard to find a smaller set of changes",name:["-d","--minimal"]},{description:"Assume large files and many scattered small changes",name:"--speed-large-files"},{description:"Output version info",name:["-v","--version"]},{description:"Show help",name:"--help"},{description:"Similar, but format old input groups with GFTM",name:"--old-group-format",args:[{name:"GFTM",description:`%<  lines from FILE1
%>  lines from FILE2
%=  lines common to FILE1 and FILE2
%[-][WIDTH][.[PREC]]{doxX}LETTER  printf-style spec for LETTER
LETTERs are as follows for new group, lower case for old group:
F  first line number
L  last line number
N  number of lines = L-F+1
E  F-1
M  L+1
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Similar, but format new input groups with GFTM",name:"--new-group-format",args:[{name:"GFTM",description:`%<  lines from FILE1
%>  lines from FILE2
%=  lines common to FILE1 and FILE2
%[-][WIDTH][.[PREC]]{doxX}LETTER  printf-style spec for LETTER
LETTERs are as follows for new group, lower case for old group:
F  first line number
L  last line number
N  number of lines = L-F+1
E  F-1
M  L+1
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Similar, but format unchanged input groups with GFTM",name:"--unchanged-group-format",args:[{name:"GFTM",description:`%<  lines from FILE1
%>  lines from FILE2
%=  lines common to FILE1 and FILE2
%[-][WIDTH][.[PREC]]{doxX}LETTER  printf-style spec for LETTER
LETTERs are as follows for new group, lower case for old group:
F  first line number
L  last line number
N  number of lines = L-F+1
E  F-1
M  L+1
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Similar, but format changed input groups with GFTM",name:"--changed-group-format",args:[{name:"GFTM",description:`%<  lines from FILE1
%>  lines from FILE2
%=  lines common to FILE1 and FILE2
%[-][WIDTH][.[PREC]]{doxX}LETTER  printf-style spec for LETTER
LETTERs are as follows for new group, lower case for old group:
F  first line number
L  last line number
N  number of lines = L-F+1
E  F-1
M  L+1
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Format all input lines with LFMT",name:"--line-format",args:[{name:"LFTM"}]},{description:"Format old input lines with LFTM",name:"--old-line-format",args:[{name:"LFTM",description:`%L  contents of line
%l  contents of line, excluding any trailing newline
%[-][WIDTH][.[PREC]]{doxX}n  printf-style spec for input line number
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Format new input lines with LFTM",name:"--new-line-format",args:[{name:"LFTM",description:`%L  contents of line
%l  contents of line, excluding any trailing newline
%[-][WIDTH][.[PREC]]{doxX}n  printf-style spec for input line number
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]},{description:"Format unchanged input lines with LFTM",name:"--unchanged-line-format",args:[{name:"LFTM",description:`%L  contents of line
%l  contents of line, excluding any trailing newline
%[-][WIDTH][.[PREC]]{doxX}n  printf-style spec for input line number
%%  %
%c'C'  the single character C
%c'OOO'  the character with octal code OOO`}]}],a={description:e,name:n,args:i,options:t};export{i as args,a as default,e as description,n as name,t as options};
//# sourceMappingURL=diff-ea4e599c.js.map
