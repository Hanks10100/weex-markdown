// Regex
const inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  link: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])\)/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  codespan: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
}

function escape (text, encode) {
  return text
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function parseInlineMarkdown (src, theme, group = [], textStyle) {
  let cap
  let inLink = false

  while (src) {
    // escape
    if (cap = inline.escape.exec(src)) {
      src = src.substring(cap[0].length)
      continue
    }

    // link
    if (cap = inline.link.exec(src)) {
      src = src.substring(cap[0].length)
      inLink = true
      const children = []
      group.push({ type: 'a', style: theme.a, attr: { href: cap[2] }, children })
      parseInlineMarkdown(cap[1], theme, children)
      inLink = false
      continue
    }

    // url
    if (!inLink && (cap = inline.url.exec(src))) {
      src = src.substring(cap[0].length)
      const href = escape(cap[1])
      group.push({
        type: 'a',
        style: theme.a,
        attr: { href },
        children: [{
          type: 'span',
          attr: { value: href }
        }]
      })
      continue
    }

    // strong
    if (cap = inline.strong.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      group.push({ type: 'span', style: theme.strong, children })
      parseInlineMarkdown(cap[2] || cap[1], theme, children)
      continue
    }

    // em
    if (cap = inline.em.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      group.push({ type: 'span', style: theme.em, children })
      parseInlineMarkdown(cap[2] || cap[1], theme, children)
      continue
    }

    // del
    if (cap = inline.del.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      group.push({ type: 'span', style: theme.del, children })
      parseInlineMarkdown(cap[1], theme, children, theme.del)
      continue
    }

    // codespan
    if (cap = inline.codespan.exec(src)) {
      src = src.substring(cap[0].length)
      group.push({ type: 'span', style: theme.codespan, attr: { value: escape(cap[2], true) } })
      continue
    }

    // text
    if (cap = inline.text.exec(src)) {
      src = src.substring(cap[0].length)
      group.push({ type: 'span', style: textStyle, attr: { value: escape(cap[0]) } })
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }
}

export function parseMarkdown (text, theme) {
  const group = []
  parseInlineMarkdown(text, theme, group)
  return group
}
