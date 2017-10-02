import { parseMarkdown } from './parser'

const getTextContent = children => children.map(
  node => node.children ? getTextContent(node.children) : node.text
).join('')

const spliterRE = /[\n\t]{2,}/
function splitContent (content) {
  return content.split(spliterRE).map(
    line => line.replace(/[\s\n\t]+/g, ' ').trim()
  )
}

export default {
  name: 'markdown',
  props: {
    content: String,
    theme: {
      type: Object,
      default () {
        return {
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
          h1: { fontSize: '74px', textAlign: 'center' },
          h2: { fontSize: '62px' },
          h3: { fontSize: '50px' },
          h4: { fontSize: '38px' },
          h5: { fontSize: '28px' },
          h6: { fontSize: '18px' },
          strong: { fontWeight: 700 },
          text: { fontSize: '32px' }
        }
      }
    }
  },
  render (h) {
    const content = this.content || getTextContent(this.$slots.default)
    return h('div', {}, splitContent(content).map(block => {
      return h('richtext', {
        style: { marginTop: '12px', marginBottom: '12px' },
        attrs: {
          value: parseMarkdown(block, this.theme)
        }
      })
    }))
  }
}
