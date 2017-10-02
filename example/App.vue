<template>
  <scroller>
    <text style="font-size:100px">----- banner -----</text>
    <markdown>
      # Big `Title`

      This *is* **Weex Markdown** component.
      wrap line. 加一点中文

      ![css Logo {650x500}](https://gw.alicdn.com/tfs/TB1788ygMMPMeJjy1XdXXasrXXa-1919-1520.jpg)

      ## Sub title

      ~~Author~~: `Hanks`oeiee`Weex`, `Vue.js` etc.

      ### Third title

      res: [weex](http://weex-project.io/) and http://weex-project.io/
    </markdown>
  </scroller>
</template>

<script>
  import Markdown from '../src/markdown.js'

  export default {
    components: { Markdown }
  }
</script>
