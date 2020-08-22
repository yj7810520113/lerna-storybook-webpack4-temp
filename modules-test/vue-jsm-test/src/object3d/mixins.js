
export default {
  methods: {
    onHover(e) {
      console.log('子节点hover了')
      this.$refs['text'].style.color = '#ff0000'
    },
    onSelect(e) {
      this.$refs['text'].style.color = '#00ff00'
    },
    onDbClick(e) {
      console.log('双击了')
    },
    onFree(e) {
      console.log('子节点Free了')
      // console.log(this  )
      this.$refs['text'].style.color = '#000000'
    },
    onDrag(e) {
      if (this.eventProps.draggable) {
        this.$refs['text'].style.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(this.$refs['text'].style.left.replace('px', '')) + 'px'
        this.$refs['text'].style.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(this.$refs['text'].style.top.replace('px', '')) + 'px'
      }
    }
  }
}
