import { parseMarkdown } from './parser'

const getTextContent = children => children.map(
  node => node.children ? getTextContent(node.children) : node.text
).join('')

export default {
  name: 'markdown',
  props: {
    content: String,
    theme: {
      type: Object,
      default: {
        a: { color: '#3333FF' },
        codespan: {
          fontFamily: 'monospace',
          backgroundColor: '#E8E8E8',
          paddingLeft: 5,
          paddingRight: 5,
          borderRadius: 3
        },
        del: { textDecoration: 'line-through' },
        em: { fontStyle: 'italic' },
        strong: { fontWeight: 700 }
      }
    }
  },
  render (h) {
    const content = this.content || getTextContent(this.$slots.default)
    return h('richtext', {
      attrs: {
        value: parseMarkdown(content, this.theme)
      }
    })
  }
}
