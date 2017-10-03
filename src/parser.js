// Regex
const blockRE = {
  heading: /^\n*(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  blockquote: /^ *>\s+([^\n]+)(\n(?!def)[^\n]+)*\n*/,
}

const inlineRE = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  image: /^!\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])(\s+\=[x\d]+)?\)/,
  link: /^\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])\)/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  codespan: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
}

// const imageSizeRE = /\=(\d+)x(\d+)/i
const imageSizeRE = /\{(\d+)x(\d+)?\}/i
function parseImageSize (str) {
  const res = imageSizeRE.exec(str)
  if (!res) {
    return { autosize: true, size: {} }
  }
  return {
    size: {
      width: parseInt(res[1], 10) + 'px',
      height: parseInt(res[2] || res[1], 10) +  'px'
    }
  }
}

function escape (text, encode) {
  return text
    // .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    // .replace(/</g, '&lt;')
    // .replace(/>/g, '&gt;')
    // .replace(/"/g, '&quot;')
    // .replace(/'/g, '&#39;')
}

export function parseInlineMarkdown (src, theme, container = [], textStyle = {}) {
  let cap
  let inLink = false
  let rootType = null
  let listLevel = 0

  while (src) {
    // escape
    if (cap = inlineRE.escape.exec(src)) {
      src = src.substring(cap[0].length)
      continue
    }

    // heading
    if (cap = blockRE.heading.exec(src)) {
      src = src.substring(cap[0].length)
      const level = cap[1].length
      rootType = `h${level}`
      const children = []
      parseInlineMarkdown(cap[2], theme, children, theme[rootType])
      if (children.length) {
        container.push({
          type: 'span',
          style: theme[rootType],
          children
        })
      }
    }

    // blockquote
    if (cap = blockRE.blockquote.exec(src)) {
      src = src.substring(cap[0].length)
      rootType = 'blockquote'
      const text = cap[0].replace(/^>\s+/, '').replace(/[\n\t]>\s+/g, '\n')
      const children = []
      parseInlineMarkdown(text, theme, children, theme.blockquote)
      if (children.length) {
        container.push({
          type: 'span',
          style: theme.blockquote,
          children
        })
      }
      continue
    }

    // image
    if (cap = inlineRE.image.exec(src)) {
      src = src.substring(cap[0].length)
      rootType = 'image'
      const res = parseImageSize(cap[1])
      container.push({
        type: 'image',
        style: Object.assign(res.size, theme.image),
        attr: { resize: "contain", autosize: res.autosize, title: cap[1], src: cap[2] }
      })
      continue
    }

    // link
    if (cap = inlineRE.link.exec(src)) {
      src = src.substring(cap[0].length)
      inLink = true
      const children = []
      parseInlineMarkdown(cap[1], theme, children, Object.assign({}, theme.a, textStyle))
      if (children.length) {
        rootType = 'a'
        container.push({
          type: 'a',
          style: theme.a,
          attr: { href: cap[2] }, children
        })
      }
      inLink = false
      continue
    }

    // url
    if (!inLink && (cap = inlineRE.url.exec(src))) {
      src = src.substring(cap[0].length)
      const href = escape(cap[1])
      rootType = 'a'
      container.push({
        type: 'a',
        style: theme.a,
        attr: { href },
        children: [{
          type: 'span',
          style: Object.assign({}, theme.text, theme.a),
          attr: { value: href }
        }]
      })
      continue
    }

    // strong
    if (cap = inlineRE.strong.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      parseInlineMarkdown(cap[2] || cap[1], theme, children)
      if (children.length) {
        container.push({ type: 'span', style: theme.strong, children })
      }
      continue
    }

    // em
    if (cap = inlineRE.em.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      parseInlineMarkdown(cap[2] || cap[1], theme, children)
      if (children.length) {
        container.push({ type: 'span', style: theme.em, children })
      }
      continue
    }

    // del
    if (cap = inlineRE.del.exec(src)) {
      src = src.substring(cap[0].length)
      const children = []
      parseInlineMarkdown(cap[1], theme, children, theme.del)
      if (children.length) {
        container.push({ type: 'span', style: theme.del, children })
      }
      continue
    }

    // codespan
    if (cap = inlineRE.codespan.exec(src)) {
      src = src.substring(cap[0].length)
      container.push({ type: 'span', attr: { value: ' ' } }) // margin-left hack
      container.push({
        type: 'span',
        style: Object.assign({}, theme.codespan, textStyle),
        attr: { value: escape(cap[2], true) }
      })
      container.push({ type: 'span', attr: { value: ' ' } }) // margin-right hack
      continue
    }

    // text
    if (cap = inlineRE.text.exec(src)) {
      src = src.substring(cap[0].length)
      container.push({
        type: 'span',
        style: Object.assign({}, theme.text, textStyle),
        attr: { value: escape(cap[0]) }
      })
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }

  return rootType
}

export function parseMarkdown (text, theme = {}) {
  const nodes = []
  return {
    rootType: parseInlineMarkdown(text, theme, nodes),
    nodes
  }
}
