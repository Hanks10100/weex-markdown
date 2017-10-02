<template>
  <div>
    <text style="font-size:100px">----- banner -----</text>
    <markdown class="">This *is* **Weex Markdown** component. ~~Author~~: `Hanks`. res: [weex](http://weex-project.io/) and http://weex-project.io/</markdown>
  </div>
</template>

<script>
  import Markdown from '../src/markdown.js'

  export default {
    components: { Markdown }
  }
</script>
