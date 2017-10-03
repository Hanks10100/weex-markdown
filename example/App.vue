<template>
  <scroller>
    <markdown style="padding:40px">
# Weex Markdown

A [Vue.js](https://vuejs.org/) component to parse and render markdown text into native components on [Weex](http://weex.apache.org/) platform.

## Usage

Use raw text content:

You can write markdown text inside it directly.

> **Notice**: The indent will break the markdown syntax rules.

Use `content` property:

### Custom styles

If passed `theme` property, the new styles will override the default theme.

## Syntax Cheetsheet

### Inline Text

*Emphasis*: use `*asterisks*` or `_underscores_`.
**Strong emphasis**: use two `**asterisks**` or `__underscores__`.
~~Strikethrough~~: uses two `~~tildes~~`.
`codespan`: use ``back-ticks`` around.

### Links

[Weex Markdown Component](https://github.com/Hanks10100/weex-markdown)

Not support reference links and relative paths.

### Images

![image alt](https://gw.alicdn.com/tfs/TB1788ygMMPMeJjy1XdXXasrXXa-1919-1520.jpg)

Not support reference image sources and relative paths.

#### Image size

In Weex, images must set `width` and `height`, otherwise it will not render.

The size of the image can be declared in `{}` within *image alt*:

![image alt {750x680}](https://gw.alicdn.com/tfs/TB1788ygMMPMeJjy1XdXXasrXXa-1919-1520.jpg)

### Blockquotes

> Use `>` before blockquote texts.

    </markdown>
  </scroller>
</template>

<script>
  import Markdown from '../src/markdown.js'

  export default {
    components: { Markdown }
  }
</script>
