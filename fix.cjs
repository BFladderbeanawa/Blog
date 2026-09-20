const fs = require("fs")

function fixHeader() {
  const content = `---
const navLinks = [
    { label: 'HOME', cn: '首页', href: '/' },
    { label: 'ABOUT', cn: '关于', href: '/about' },
    { label: 'NOVEL', cn: '小说', href: '/category/novel' },
    { label: 'ARTICLE', cn: '文章', href: '/blog' }
];

const currentPath = Astro.url.pathname;
const isActive = (href) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
};
---
<header class="site-header">
  <nav class="nav-container">
    <div class="nav-line"></div>
    <div class="nav-links">
      {navLinks.map((link) => (
        <a href={link.href} class={["nav-item", isActive(link.href) ? "active" : ""]}>
          <span class="cn-label">{link.cn}</span>
          <span class="en-label">{link.label}</span>
        </a>
      ))}
    </div>
  </nav>
</header>
<style>
  .site-header { position: absolute; top: 40px; left: 40px; z-index: var(--z-header); min-width: 400px; }
  .nav-container { position: relative; padding-top: 24px; padding-left: 20px; }
  .nav-line { position: absolute; top: 32px; left: 0; width: 100%; height: 1px; background: var(--navy); opacity: 0.5; }
  .nav-line::after { content: ""; position: absolute; right: 0; top: -2px; width: 5px; height: 5px; border-radius: 50%; background: var(--navy); }
  .nav-links { display: flex; gap: 32px; position: relative; z-index: 2; }
  .nav-item { display: flex; flex-direction: column; align-items: flex-start; text-decoration: none; position: relative; color: var(--navy); opacity: 0.7; transition: all 0.3s; }
  .nav-item:hover, .nav-item.active { opacity: 1; }
  .cn-label { font-size: 12px; font-family: var(--font-base); font-weight: 500; margin-bottom: 2px; }
  .en-label { font-size: 16px; font-family: var(--font-display); font-weight: 700; letter-spacing: 1px; background: var(--canvas); padding-right: 8px; }
  .nav-item::before { content: ""; position: absolute; top: 50%; left: -6px; width: 3px; height: 3px; background: var(--accent-pink); border-radius: 50%; opacity: 0; transition: 0.2s; }
  .nav-item.active::before { opacity: 1; left: -10px; }
</style>
`
  fs.writeFileSync("src/components/Header.astro", content, "utf8")
}
fixHeader()
