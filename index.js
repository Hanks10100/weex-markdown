(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WeexMarkdownComponent = factory());
}(this, (function () { 'use strict';

// Regex
var inlineRE = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  image: /^!\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])(\s+\=[x\d]+)?\)/,
  link: /^\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])\)/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  codespan: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
};

// const imageSizeRE = /\=(\d+)x(\d+)/i
var imageSizeRE = /\{(\d+)x(\d+)?\}/i;
function parseImageSize (str) {
  var res = imageSizeRE.exec(str);
  if (!res) {
    return { width: 0, height: 0 }
  }
  return {
    width: parseInt(res[1], 10),
    height: parseInt(res[2] || res[1], 10)
  }
}

function escape (text, encode) {
  return text
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseInlineMarkdown (src, theme, container, textStyle) {
  if ( container === void 0 ) container = [];

  var cap;
  var inLink = false;
  var rootType = null;

  while (src) {
    // escape
    if (cap = inlineRE.escape.exec(src)) {
      src = src.substring(cap[0].length);
      continue
    }

    // heading
    if (cap = inlineRE.heading.exec(src)) {
      src = src.substring(cap[0].length);
      var level = cap[1].length;
      rootType = "h" + level;
      var children = [];
      parseInlineMarkdown(cap[2], theme, children, theme[rootType]);
      if (children.length) {
        container.push({
          type: 'span',
          style: theme[rootType],
          children: children
        });
      }
    }

    // image
    if (cap = inlineRE.image.exec(src)) {
      src = src.substring(cap[0].length);
      rootType = 'image';
      container.push({
        type: 'image',
        style: Object.assign(parseImageSize(cap[1]), theme.image),
        attr: { resize: "contain", title: cap[1], src: cap[2] }
      });
      continue
    }

    // link
    if (cap = inlineRE.link.exec(src)) {
      src = src.substring(cap[0].length);
      inLink = true;
      var children$1 = [];
      parseInlineMarkdown(cap[1], theme, children$1);
      if (children$1.length) {
        rootType = 'a';
        container.push({
          type: 'a',
          style: theme.a,
          attr: { href: cap[2] }, children: children$1
        });
      }
      inLink = false;
      continue
    }

    // url
    if (!inLink && (cap = inlineRE.url.exec(src))) {
      src = src.substring(cap[0].length);
      var href = escape(cap[1]);
      rootType = 'a';
      container.push({
        type: 'a',
        style: theme.a,
        attr: { href: href },
        children: [{
          type: 'span',
          attr: { value: href }
        }]
      });
      continue
    }

    // strong
    if (cap = inlineRE.strong.exec(src)) {
      src = src.substring(cap[0].length);
      var children$2 = [];
      parseInlineMarkdown(cap[2] || cap[1], theme, children$2);
      if (children$2.length) {
        container.push({ type: 'span', style: theme.strong, children: children$2 });
      }
      continue
    }

    // em
    if (cap = inlineRE.em.exec(src)) {
      src = src.substring(cap[0].length);
      var children$3 = [];
      parseInlineMarkdown(cap[2] || cap[1], theme, children$3);
      if (children$3.length) {
        container.push({ type: 'span', style: theme.em, children: children$3 });
      }
      continue
    }

    // del
    if (cap = inlineRE.del.exec(src)) {
      src = src.substring(cap[0].length);
      var children$4 = [];
      parseInlineMarkdown(cap[1], theme, children$4, theme.del);
      if (children$4.length) {
        container.push({ type: 'span', style: theme.del, children: children$4 });
      }
      continue
    }

    // codespan
    if (cap = inlineRE.codespan.exec(src)) {
      src = src.substring(cap[0].length);
      container.push({ type: 'span', attr: { value: ' ' } }); // margin-left hack
      container.push({
        type: 'span',
        style: Object.assign({}, theme.codespan, textStyle),
        attr: { value: escape(cap[2], true) }
      });
      container.push({ type: 'span', attr: { value: ' ' } }); // margin-right hack
      continue
    }

    // text
    if (cap = inlineRE.text.exec(src)) {
      src = src.substring(cap[0].length);
      container.push({
        type: 'span',
        style: Object.assign({}, theme.text, textStyle),
        attr: { value: escape(cap[0]) }
      });
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }

  return rootType
}

function parseMarkdown (text, theme) {
  if ( theme === void 0 ) theme = {};

  var nodes = [];
  return {
    rootType: parseInlineMarkdown(text, theme, nodes),
    nodes: nodes
  }
}

var getTextContent = function (children) { return children.map(
  function (node) { return node.children ? getTextContent(node.children) : node.text; }
).join(''); };

var spliterRE = /[\n\t]{2,}/;
function splitContent (content) {
  return content.split(spliterRE).map(
    function (line) { return line.replace(/[\s\n\t]+/g, ' ').trim(); }
  )
}

var defaultTheme = {
  a: { color: '#3333FF' },
  codespan: {
    fontFamily: 'monospace',
    fontSize: '32px',
    backgroundColor: '#E8E8E8',
    paddingLeft: 2, paddingRight: 2,
    marginLeft: 2, marginRight: 2,
    borderRadius: 3
  },
  del: { textDecoration: 'line-through' },
  em: { fontStyle: 'italic' },
  h1: { fontSize: '74px', textAlign: 'center' },
  h2: { fontSize: '62px' },
  h3: { fontSize: '50px' },
  h4: { fontSize: '38px' },
  h5: { fontSize: '28px' },
  h6: { fontSize: '18px' },
  strong: { fontWeight: 700 },
  text: { fontSize: '32px' },
  imageWrapper: { alignSelf: 'center', marginTop: '20px', marginBottom: '20px' },
  h1Wrapper: { alignSelf: 'center', marginTop: '30px', marginBottom: '30px' },
  h2Wrapper: { marginTop: '24px', marginBottom: '24px' },
  h3Wrapper: { marginTop: '18px', marginBottom: '18px' },
  blockWrapper: { color: '#333', marginTop: '12px', marginBottom: '12px' }
};

var markdown = {
  name: 'markdown',
  props: {
    content: String,
    theme: Object,
  },
  methods: {
    getStyles: function getStyles () {
      var this$1 = this;

      if (!this.theme) {
        return defaultTheme
      }
      // merge default styles
      var styles = {};
      for (var type in defaultTheme) {
        styles[type] = Object.assign({}, defaultTheme[type], this$1.theme[type]);
      }
      return styles
    }
  },
  render: function render (h) {
    var content = this.content || getTextContent(this.$slots.default);
    var styles = this.getStyles();
    return h('div', {}, splitContent(content).map(function (block) {
      var ref = parseMarkdown(block, styles);
      var rootType = ref.rootType;
      var nodes = ref.nodes;
      var wrapperStyle = styles.blockWrapper;
      switch (rootType) {
        case 'image': return h('image', {
          style: Object.assign({}, styles.imageWrapper, nodes[0].style),
          attrs: Object.assign({}, nodes[0].attr)
        })
        case 'h1': wrapperStyle = styles.h1Wrapper; break
        case 'h2': wrapperStyle = styles.h2Wrapper; break
        case 'h3': wrapperStyle = styles.h3Wrapper; break
      }
      return h('richtext', {
        style: wrapperStyle,
        attrs: { value: nodes }
      })
    }))
  }
};

return markdown;

})));
