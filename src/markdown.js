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

const defaultTheme = {
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
}

export default {
  name: 'markdown',
  props: {
    content: String,
    theme: Object,
  },
  methods: {
    getStyles () {
      if (!this.theme) {
        return defaultTheme
      }
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
      let wrapperStyle = styles.blockWrapper
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
}
