const fs = require("fs")
let index = fs.readFileSync("src/pages/index.astro", "utf8")

// Replace "tanh \ 桁 +" with something more personal/blog-like
index = index.replace(/tanh \\\\ 桁/g, "BFLadder / DEV")

// Replace "● ARTICLE" with logic logs
index = index.replace(
  '<span class="ar-label l1">● ARTICLE</span>',
  '<span class="ar-label l1">● SYSTEM</span>',
)
index = index.replace(
  '<span class="ar-label l2">● ARTICLE</span>',
  '<span class="ar-label l2">● LOG_1X</span>',
)
index = index.replace(
  '<span class="ar-label l3">● ARTICLE</span>',
  '<span class="ar-label l3">● OUTPUT</span>',
)
index = index.replace('<div class="ar-year">2026</div>', '<div class="ar-year">B-F LADDER</div>')

// Replace "01 02 + 03 04"
index = index.replace('<span class="num n01">01</span>', '<span class="num n01">SYS</span>')
index = index.replace('<span class="num n02">02</span>', '<span class="num n02">.IO</span>')
index = index.replace('<span class="num n03">03</span>', '<span class="num n03">MEM</span>')
index = index.replace('<span class="num n04">04</span>', '<span class="num n04">.RT</span>')

// Clean up tag mock blocks AAAA
index = index.replace(/<span>AAAA<\/span>/g, '<span class="blank-tag">...</span>')

fs.writeFileSync("src/pages/index.astro", index, "utf8")
