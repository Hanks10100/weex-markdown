(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WeexMarkdownComponent = factory());
}(this, (function () { 'use strict';

// Regex
var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  link: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\((https?:\/\/[^\s<]+[^<.,:;"')\]\s])\)/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  codespan: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: /^[\s\S]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
};

function escape (text, encode) {
  return text
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseInlineMarkdown (src, theme, group, textStyle) {
  if ( group === void 0 ) group = [];

  var cap;
  var inLink = false;

  while (src) {
    // escape
    if (cap = inline.escape.exec(src)) {
      src = src.substring(cap[0].length);
      continue
    }

    // link
    if (cap = inline.link.exec(src)) {
      src = src.substring(cap[0].length);
      inLink = true;
      var children = [];
      group.push({ type: 'a', style: theme.a, attr: { href: cap[2] }, children: children });
      parseInlineMarkdown(cap[1], theme, children);
      inLink = false;
      continue
    }

    // url
    if (!inLink && (cap = inline.url.exec(src))) {
      src = src.substring(cap[0].length);
      var href = escape(cap[1]);
      group.push({
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
    if (cap = inline.strong.exec(src)) {
      src = src.substring(cap[0].length);
      var children$1 = [];
      group.push({ type: 'span', style: theme.strong, children: children$1 });
      parseInlineMarkdown(cap[2] || cap[1], theme, children$1);
      continue
    }

    // em
    if (cap = inline.em.exec(src)) {
      src = src.substring(cap[0].length);
      var children$2 = [];
      group.push({ type: 'span', style: theme.em, children: children$2 });
      parseInlineMarkdown(cap[2] || cap[1], theme, children$2);
      continue
    }

    // del
    if (cap = inline.del.exec(src)) {
      src = src.substring(cap[0].length);
      var children$3 = [];
      group.push({ type: 'span', style: theme.del, children: children$3 });
      parseInlineMarkdown(cap[1], theme, children$3, theme.del);
      continue
    }

    // codespan
    if (cap = inline.codespan.exec(src)) {
      src = src.substring(cap[0].length);
      group.push({ type: 'span', style: theme.codespan, attr: { value: escape(cap[2], true) } });
      continue
    }

    // text
    if (cap = inline.text.exec(src)) {
      src = src.substring(cap[0].length);
      group.push({ type: 'span', style: textStyle, attr: { value: escape(cap[0]) } });
      continue
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0))
    }
  }
}

function parseMarkdown (text, theme) {
  var group = [];
  parseInlineMarkdown(text, theme, group);
  return group
}

var getTextContent = function (children) { return children.map(
  function (node) { return node.children ? getTextContent(node.children) : node.text; }
).join(''); };

var markdown = {
  name: 'markdown',
  props: {
    content: String,
    theme: {
      type: Object,
      default: {
        a: { color: '#3333FF' },
        codespan: {
          fontFamily: 'monospace',
          backgroundColor: '#ddd',
          paddingLeft: 20,
          paddingRight: 20,
          borderRadius: 10
        },
        del: { textDecoration: 'line-through' },
        em: { fontStyle: 'italic' },
        strong: { fontWeight: 700 }
      }
    }
  },
  render: function render (h) {
    var content = this.content || getTextContent(this.$slots.default);
    return h('richtext', {
      style: { fontSize: 60, color: '#404040' },
      attrs: {
        value: parseMarkdown(content, this.theme)
      }
    })
  }
};

return markdown;

})));
