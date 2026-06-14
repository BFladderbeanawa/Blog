const e="Determine file type",t="file",i=[{name:"file",description:"File name(s)",template:["filepaths"],isVariadic:!0,isOptional:!0}],n=[{description:"Print a help message and exit",name:"--help"},{description:`Causes the file command to output the file type and creator code
as used by older MacOS versions.  The code consists of eight
letters, the first describing the file type, the latter the
creator.  This option works properly only for file formats that
have the apple-style output defined`,name:"--apple"},{description:"Do not prepend filenames to output lines (brief mode)",name:["--brief","-b"]},{description:`Cause a checking printout of the parsed form of the magic file.
This is usually used in conjunction with the -m option to debug a
new magic file before installing it`,name:["--checking-printoug","-c"]},{description:`Write a magic.mgc output file that contains a pre-parsed version
of the magic file or directory`,name:["--compile","-C"]},{description:`Apply the default system tests; this is the default behavior
unless -M is specified`,name:"-d"},{description:"Print debugging messages",name:"-D"},{description:`On filesystem errors (file not found etc), instead of handling
the error as regular output as POSIX mandates and keep going,
issue an error message and exit`,name:"-E"},{description:`Exclude the test named in testname from the list of tests made to
determine the file type`,name:["--exclude","-e"],args:[{name:"testname",suggestions:["apptype","ascii","encoding","token","cdf","compress","csv","elf","json","soft","tar"]}]},{description:`Like --exclude but ignore tests that file does not know about.
This is intended for compatibility with older versions of file`,name:"--exclude-quiet"},{description:`Print a slash-separated list of valid extensions for the file
type found`,name:"--extension"},{description:`Use the specified string as the separator between the filename
and the file result returned`,name:["--separator","-F"],args:[{name:"separator",suggestions:["."]}]},{description:`Read the names of the files to be examined from namefile (one per
line) before the argument list.  Either namefile or at least one
filename argument must be present; to test the standard input,
use ‘-’ as a filename argument.  Please note that namefile is
unwrapped and the enclosed filenames are processed when this
option is encountered and before any further options processing
is done.  This allows one to process multiple lists of files with
different command line arguments on the same file invocation.
Thus if you want to set the delimiter, you need to do it before
you specify the list of files, like: "-F @ -f namefile", instead
of: "-f namefile -F @"`,name:["--files-from","-f"],args:[{name:"namefile"}]},{description:`This option causes symlinks not to be followed (on systems that
support symbolic links)`,name:["--no-dereference","-h"]},{description:"If the file is a regular file, do not classify its contents",name:"-i"},{description:`Causes the file command to output mime type strings rather than
the more traditional human readable ones.  Thus it may say
'text/plain; charset=us-ascii' rather than "ASCII text"`,name:["--mime","-I"]},{description:"Like -I, but print only the specified element(s)",name:["--mime-type","--mime-encoding"]},{description:`Don't stop at the first match, keep going.  Subsequent matches
will be have the string '\\012- ' prepended.  (If you want a
newline, see the -r option.)  The magic pattern with the highest
strength (see the -l option) comes first`,name:["--keep-going","-k"]},{description:`Shows a list of patterns and their strength sorted descending by
magic(5) strength which is used for the matching (see also the -k
option)`,name:["--list","-l"]},{description:`This option causes symlinks to be followed, as the like-named
option in ls(1) (on systems that support symbolic links).  This
is the default behavior`,name:["--dereference","-L"]},{description:`Specify an alternate list of files and directories containing
magic.  This can be a single item, or a colon-separated list.  If
a compiled magic file is found alongside a file or directory, it
will be used instead`,name:["--magic-file","-m"],args:[{name:"list",template:["filepaths"]}]},{description:`Like -m, except that the default rules are not applied unless -d
is specified`,name:"-M",args:[{name:"list",template:["filepaths"]}]},{description:`Force stdout to be flushed after checking each file.  This is
only useful if checking a list of files.  It is intended to be
used by programs that want filetype output from a pipe`,name:["--no-buffer","-n"]},{description:`On systems that support utime(3) or utimes(2), attempt to
preserve the access time of files analyzed, to pretend that file
never read them`,name:["--preserve-data","-p"]},{description:"Set various parameter limits",name:["--parameter","-P"],args:[{name:"name=value"}]},{description:"No operation, included for historical compatibility",name:["--raw","-r"]},{description:`Normally, file only attempts to read and determine the type of
argument files which stat(2) reports are ordinary files.  This
prevents problems, because reading special files may have
peculiar consequences.  Specifying the -s option causes file to
also read argument files which are block or character special
files.  This is useful for determining the filesystem types of
the data in raw disk partitions, which are block special files.
This option also causes file to disregard the file size as
reported by stat(2) since on some systems it reports a zero size
for raw disk partitions`,name:["--special-files","s"]},{description:"Print the version of the program and exit",name:["--version","-v"]},{description:"Try to look inside compressed files",name:["--uncompress","-z"]},{description:`Try to look inside compressed files, but report information about
the contents only not the compression`,name:["--uncompress-noreport","-Z"]},{description:`Output a null character '\0' after the end of the filename.  Nice
to cut(1) the output.  This does not affect the separator, which
is still printed`,name:["--print0","-0"]}],s={optionsMustPrecedeArguments:!0},o={description:e,name:t,args:i,options:n,parserDirectives:s};export{i as args,o as default,e as description,t as name,n as options,s as parserDirectives};
//# sourceMappingURL=file-559638c8.js.map
