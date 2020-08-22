<!--  -->
<template>
  <div
    :ref="'text'"
    :style="baseStyle"
  >
    我是可以被拖拽的节点
  </div>
</template>

<script>
import mixins from './mixins'
export default {
  name: 'DragOject3d',
  components: {},
  mixins: [mixins],
  props: {
    uuid: {
      type: Number,
      default: 10
    },
    domStyle: {
      type: Object,
      default: () => {
        return {
          position: 'absolute',
          userSelect: 'none',
          color: '#000000',
          left: '400px',
          top: '200px',
          fontSize: '20px',
          width: '200px'
        }
      }
    }
  },
  data() {
    return {
      baseStyle: {
        position: 'absolute',
        userSelect: 'none',
        color: '#000000',
        left: '400px',
        top: '200px',
        fontSize: '20px',
        width: '200px'
      },
      eventProps: {
        draggable: false,
        selectable: true
      }
    }
  },
  computed: {
  },
  watch: {
    domStyle: {
      handler() {
        Object.assign(this.baseStyle, this.domStyle)
      },
      deep: true
    }
  },
  created() {
    return Object.assign(this.baseStyle, this.domStyle)
  }
}

</script>
<style lang='scss' scoped>
div{
  user-select: none;
}
</style>
