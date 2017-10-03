# Weex Markdown Component

A [Vue.js](https://vuejs.org/) component to parse and render markdown text into native components on [Weex](http://weex.apache.org/) platform.

## Properties

+ `content`: markdown text content.
+ `theme`: mardown style theme.

## Usage

### Raw text content

You can write markdown text inside it directly.

```html
<markdown>
# This is a Big Title

**something inside.**

by [Hanks](https://github.com/hanks10100).
</markdown>
```

> **Notice**: The indent will break the markdown syntax rules.

```html
<div>
  <markdown>
    # Invalid Title

    *Emphasis* stil **works**.
  </markdown>
</div>
```

### Use `content` property

```html
<markdown content="This _text_ *will be __rendered__ too*.">
```

You can also binding the content with a javascript variable:

```html
<markdown v-bind:content="article">
```

The `article` may defined like this:

```js
new Vue({
  data () {
    return {
      article: '# Title\n\nFirst paragraph.'
    }
  }
})
```

### Custom styles

If passed `theme` property, the new styles will override the default theme.

```js
new Vue({
  template: `
    <markdown :theme="newTheme"></markdown>
  `,
  data () {
    return {
      newTheme: {
        h1: {
          color: '#FF6600',
          fontWeight: 'bold'
        }
      }
    }
  }
})
```

#### Default Theme

See [src/markdown.js](./src/markdown.js#L3).

## Syntax Cheetsheet

### Headers

```
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

### Inline Text

+ *Emphasis*: use `*asterisks*` or `_underscores_`.
+ **Strong emphasis**: use two `**asterisks**` or `__underscores__`.
+ ~~Strikethrough~~: uses two `~~tildes~~`.
+ `codespan`: use ``back-ticks`` around.

### Links

```
[link name](http://whatever.link.address)
```

Not support reference links and relative paths.

### Images

```
![image alt](http://image.address/whatever.png)
```

Not support reference image sources and relative paths.

#### Image size

In Weex, images must set `width` and `height`, otherwise it will not render.

The size of the image can be declared in `{}` within *image alt*:

```
![image alt {750x640}](http://image.address/whatever.png)
```

+ `{500x400}` means width is 500px and height is 400px.
+ `{480x}` means both width and height are 480px.
+ `{640}` is invalid.

### Blockquotes

> Use `>` before blockquote texts.

```
> Use `>` before blockquote texts.
```

### Unsupported Syntax

+ [ ] Lists
+ [ ] Code blocks
+ [ ] Tables
+ [ ] Inline HTML
