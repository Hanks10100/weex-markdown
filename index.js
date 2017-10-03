(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WeexMarkdownComponent = factory());
}(this, (function () { 'use strict';

// Regex
var blockRE = {
  heading: /^\n*(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  blockquote: /^ *>\s+([^\n]+)(\n(?!def)[^\n]+)*\n*/,
};

var inlineRE = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
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

function parseInlineMarkdown (src, theme, container, textStyle) {
  if ( container === void 0 ) container = [];
  if ( textStyle === void 0 ) textStyle = {};

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
    if (cap = blockRE.heading.exec(src)) {
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

    // blockquote
    if (cap = blockRE.blockquote.exec(src)) {
      src = src.substring(cap[0].length);
      rootType = 'blockquote';
      var text = cap[0].replace(/^>\s+/, '').replace(/[\n\t]>\s+/g, '\n');
      var children$1 = [];
      parseInlineMarkdown(text, theme, children$1, theme.blockquote);
      if (children$1.length) {
        container.push({
          type: 'span',
          style: theme.blockquote,
          children: children$1
        });
      }
      continue
    }

    // image
    if (cap = inlineRE.image.exec(src)) {
      src = src.substring(cap[0].length);
      rootType = 'image';
      var res = parseImageSize(cap[1]);
      container.push({
        type: 'image',
        style: Object.assign(res.size, theme.image),
        attr: { resize: "contain", autosize: res.autosize, title: cap[1], src: cap[2] }
      });
      continue
    }

    // link
    if (cap = inlineRE.link.exec(src)) {
      src = src.substring(cap[0].length);
      inLink = true;
      var children$2 = [];
      parseInlineMarkdown(cap[1], theme, children$2, Object.assign({}, theme.a, textStyle));
      if (children$2.length) {
        rootType = 'a';
        container.push({
          type: 'a',
          style: theme.a,
          attr: { href: cap[2] }, children: children$2
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
          style: Object.assign({}, theme.text, theme.a),
          attr: { value: href }
        }]
      });
      continue
    }

    // strong
    if (cap = inlineRE.strong.exec(src)) {
      src = src.substring(cap[0].length);
      var children$3 = [];
      parseInlineMarkdown(cap[2] || cap[1], theme, children$3);
      if (children$3.length) {
        container.push({ type: 'span', style: theme.strong, children: children$3 });
      }
      continue
    }

    // em
    if (cap = inlineRE.em.exec(src)) {
      src = src.substring(cap[0].length);
      var children$4 = [];
      parseInlineMarkdown(cap[2] || cap[1], theme, children$4);
      if (children$4.length) {
        container.push({ type: 'span', style: theme.em, children: children$4 });
      }
      continue
    }

    // del
    if (cap = inlineRE.del.exec(src)) {
      src = src.substring(cap[0].length);
      var children$5 = [];
      parseInlineMarkdown(cap[1], theme, children$5, theme.del);
      if (children$5.length) {
        container.push({ type: 'span', style: theme.del, children: children$5 });
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
    function (line) { return line; }//.trim(/[\n\t]/)
    // line => line.replace(/[\n\t]\s+/g, ' ').trim(/[\n\t]/)
  )
}

var defaultTheme = {
  a: { color: '#3333FF', textDecoration: 'none' },
  codespan: {
    fontFamily: 'monospace',
    fontSize: '32px',
    backgroundColor: '#E8E8E8',
    paddingLeft: '8px', paddingRight: '8px',
    marginLeft: '4px', marginRight: '4px',
    borderRadius: '6px'
  },
  del: { textDecoration: 'line-through' },
  em: { fontStyle: 'italic' },
  h1: { fontSize: '52px', textAlign: 'center' },
  h2: { fontSize: '45px' },
  h3: { fontSize: '38px' },
  h4: { fontSize: '30px' },
  h5: { fontSize: '24px' },
  h6: { fontSize: '18px' },
  blockquote: { color: '#606060' },
  blockquoteBlock: {
    backgroundColor: '#F4F4F4',
    margin: '20px',
    padding: '15px',
    borderLeftWidth: '8px',
    borderLeftColor: '#BBB'
  },
  strong: { fontWeight: 700 },
  text: { fontSize: '32px' },
  imageBlock: { alignSelf: 'center', marginTop: '20px', marginBottom: '20px' },
  h1Block: { alignSelf: 'center', marginTop: '30px', marginBottom: '30px' },
  h2Block: { marginTop: '24px', marginBottom: '24px' },
  h3Block: { marginTop: '18px', marginBottom: '18px' },
  block: { color: '#333', marginTop: '12px', marginBottom: '12px' }
};

function mapNodeToElement (nodes, h, inheritStyles) {
  if ( inheritStyles === void 0 ) inheritStyles = {};

  if (!Array.isArray(nodes)) {
    return null
  }
  return nodes.map(function (node) {
    var style = Object.assign({}, inheritStyles, node.style);
    var children = mapNodeToElement(node.children, h, node.style);
    switch (node.type) {
      case 'span': return h('span', { style: style }, node.attr ? node.attr.value : children)
      case 'a': return h('html:a', { style: style, attrs: { href: node.attr.href } }, children)
    }
  })
}

var MarkdownImage = {
  props: ['autosize', 'src'],
  data: function data () {
    return {
      width: 750,
      height: 200
    }
  },
  render: function render (h) {
    var this$1 = this;

    if (this.autosize) {
      return h('image', {
        style: { width: this.width, height: this.height },
        attrs: { src: this.src },
        on: {
          load: function (event) {
            if (!event.success) { return; }
            var ratio = event.size.naturalHeight / event.size.naturalWidth;
            var width = Math.min(750, event.size.naturalWidth);
            this$1.width = width + 'px';
            this$1.height = width * ratio + 'px';
          }
        }
      })
    }
    return h('image', { attrs: { src: this.src } })
  }
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

      if (!this.theme) { return defaultTheme }
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
      var blockStyle = styles.block;
      switch (rootType) {
        case 'image': {
          return h(MarkdownImage, {
            style: Object.assign({}, styles.imageBlock, nodes[0].style),
            attrs: nodes[0].attr
          })
        }
        case 'blockquote': blockStyle = styles.blockquoteBlock; break;
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5':
        case 'h6': blockStyle = styles[(rootType + "Block")]; break
      }
      if (typeof WXEnvironment === 'object' && WXEnvironment.platform === 'Web') {
        return h('p', { style: blockStyle }, mapNodeToElement(nodes, h))
      }
      return h('richtext', { style: blockStyle, attrs: { value: nodes } })
    }))
  }
};

return markdown;

})));
