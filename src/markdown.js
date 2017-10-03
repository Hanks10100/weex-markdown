import { parseMarkdown } from './parser'

const getTextContent = children => children.map(
  node => node.children ? getTextContent(node.children) : node.text
).join('')

const spliterRE = /[\n\t]{2,}/
function splitContent (content) {
  return content.split(spliterRE).map(
    line => line//.trim(/[\n\t]/)
    // line => line.replace(/[\n\t]\s+/g, ' ').trim(/[\n\t]/)
  )
}

const defaultTheme = {
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
}

function mapNodeToElement (nodes, h, inheritStyles = {}) {
  if (!Array.isArray(nodes)) {
    return null
  }
  return nodes.map(node => {
    const style = Object.assign({}, inheritStyles, node.style)
    const children = mapNodeToElement(node.children, h, node.style)
    switch (node.type) {
      case 'span': return h('span', { style }, node.attr ? node.attr.value : children)
      case 'a': return h('html:a', { style, attrs: { href: node.attr.href } }, children)
    }
  })
}

const MarkdownImage = {
  props: ['autosize', 'src'],
  data () {
    return {
      width: 750,
      height: 200
    }
  },
  render (h) {
    if (this.autosize) {
      return h('image', {
        style: { width: this.width, height: this.height },
        attrs: { src: this.src },
        on: {
          load: event => {
            if (!event.success) return;
            const ratio = event.size.naturalHeight / event.size.naturalWidth
            const width = Math.min(750, event.size.naturalWidth)
            this.width = width + 'px'
            this.height = width * ratio + 'px'
          }
        }
      })
    }
    return h('image', { attrs: { src: this.src } })
  }
}

export default {
  name: 'markdown',
  props: {
    content: String,
    theme: Object,
  },
  methods: {
    getStyles () {
      if (!this.theme) return defaultTheme
      // merge default styles
      const styles = {}
      for (const type in defaultTheme) {
        styles[type] = Object.assign({}, defaultTheme[type], this.theme[type])
      }
      return styles
    }
  },
  render (h) {
    const content = this.content || getTextContent(this.$slots.default)
    const styles = this.getStyles()
    return h('div', {}, splitContent(content).map(block => {
      const { rootType, nodes } = parseMarkdown(block, styles)
      let blockStyle = styles.block
      switch (rootType) {
        case 'image': {
          return h(MarkdownImage, {
            style: Object.assign({}, styles.imageBlock, nodes[0].style),
            attrs: nodes[0].attr
          })
        }
        case 'blockquote': blockStyle = styles.blockquoteBlock; break;
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5':
        case 'h6': blockStyle = styles[`${rootType}Block`]; break
      }
      if (typeof WXEnvironment === 'object' && WXEnvironment.platform === 'Web') {
        return h('p', { style: blockStyle }, mapNodeToElement(nodes, h))
      }
      return h('richtext', { style: blockStyle, attrs: { value: nodes } })
    }))
  }
}
