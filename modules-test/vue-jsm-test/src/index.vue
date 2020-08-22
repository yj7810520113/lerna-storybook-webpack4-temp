<template>
  <div
    :ref="'parentNode'"
    style="height:800px;width:100%;background-color:#e5f5f9;"
    :style="style"
    @mouseover.stop.prevent="onHover"
    @mouseout.stop.prevent="onMouseOut"
    @mousedown.stop.prevent="onMouseDown"
    @mouseup.stop.prevent="onMouseUp"
    @mousemove.stop.prevent="onMouseMove"
    @click.prevent.stop="onclick"
  >
    <DraggableObject
      :hover-queue.sync="hoverQueue"
      :select-queue.sync="selectQueue"
    />
    <SelectableObject
      :hover-queue.sync="hoverQueue"
      :select-queue.sync="selectQueue"
    />
    <div style="top:500px;left:500px;position:absolute;border:2px;">
      障碍物
    </div>
  </div>
</template>

<script>
import DraggableObject from './layer/draggable'
import SelectableObject from './layer/selectable'
import { selectObjectSubject } from './bus/event'
const StateMachine = require('javascript-state-machine')
export default {
  components: {
    DraggableObject,
    SelectableObject
  },
  data() {
    return {
      selectQueue: [],
      hoverQueue: [],
      uuid: 1,
      parentNode: null,
      changeTimespan: 0,
      eventProps: {
        draggable: true,
        selectable: false
      },
      style: {
        position: 'absolute',
        userSelect: 'none',
        color: '#000000',
        left: '0px',
        top: '0px',
        fontSize: '20px'
      },
      mouseDownXY: {
        x: 0, y: 0
      },
      jsm: new StateMachine({
        init: 'free',
        transitions: [
          { name: 'free-hover', from: 'free', to: 'hover' },
          { name: 'hover-free', from: 'hover', to: 'free' }, // 鼠标移出
          { name: 'hover-hover_move', from: 'hover', to: 'hoverMove' },
          { name: 'hover-click', from: 'hover', to: 'click' },
          { name: 'click-hover', from: 'click', to: 'hover' },
          { name: 'click-select', from: 'click', to: 'select' },
          { name: 'select-free', from: 'select', to: 'free' },
          { name: 'hover_move-double', from: 'hoverMove', to: 'hoverMove' },
          { name: 'hover_move-free', from: 'hoverMove', to: 'free' },
          { name: 'hover-hover_down', from: ['hover', 'hoverMove'], to: 'hoverDown' }, // 鼠标移动到物体上，并按下
          { name: 'hover_down-up', from: 'hoverDown', to: 'up' }, // 鼠标按下后直接弹起
          { name: 'hover_down-down_move', from: 'hoverDown', to: 'downMove' }, // 鼠标按下，开始移动
          { name: 'down_move-double', from: 'downMove', to: 'downMove' }, // 鼠标按下，持续移动
          { name: 'down_move-up', from: 'downMove', to: 'up' }, // 停止移动了，鼠标弹起
          { name: 'down_move-free', from: 'downMove', to: 'free' }, // 鼠标移动太快，跑了出去
          { name: 'up-hover', from: 'up', to: 'hover' }, // 鼠标弹起后判断鼠标还在物体上，触发弹起事件
          { name: 'up-free', from: 'up', to: 'free' } // 鼠标弹起后，鼠标不在物体上，回到free状态
        ],
        methods: {
          onInvalidTransition: function(transition, from, to) {
            console.error(`transition not allowed from: ${from}  to: ${to}`)
            this.jsm.goto('free')
          },
          onTransition: (e) => {
            // console.log(e)
          },
          onFreeHover: () => {
            this.jsmHover()
          },
          onHoverFree: () => {
            this.jsmFree()
          },
          onHoverHoverMove: () => {},
          onHoverClick: () => { this.jsmClick() },
          onClickHover: () => { this.jsmHover() },
          onClickSelect: () => {},
          onSelectFree: () => { this.jsmFree() },
          onHoverMoveDouble: (trans, e) => { },
          onHoverMoveFree: () => {
            this.jsmFree()
          },
          onHoverHoverDown: () => {
            this.jsmDown()
          },
          onHoverDownUp: () => {
            this.jsmUp()
          },
          onHoverDownDownMove: () => {},
          onDownMoveDoule: () => {},
          onDownMoveUp: () => {},
          onDownMoveFree: () => { this.jsmFree() },
          onUpHover: () => {
            this.jsmHover()
          },
          onUpFree: () => {
            this.jsmFree()
          }
        }
      })
    }
  },
  methods: {
    onHover(e) {
      if (this.jsm.can('free-hover')) {
        this.jsm.freeHover()
      }
    },
    onMouseOut() {
      if (this.jsm.can('hover-free')) {
        this.jsm.hoverFree()
      } else if (this.jsm.can('hover_move-free')) {
        this.jsm.hoverMoveFree()
      } else if (this.jsm.can('down_move-free')) { // 移动太快跟不上了
        this.jsm.downMoveFree()
      }
    },
    onMouseDown(e) {
      this.mouseDownXY.x = e.offsetX
      this.mouseDownXY.y = e.offsetY
      if (this.jsm.can('hover-hover_down')) {
        this.jsm.hoverHoverDown()
      }
    },
    onMouseUp() {
      if (this.jsm.can('hover_down-up')) {
        this.jsm.hoverDownUp()
        this.jsm.upHover()
      }
      if (this.jsm.can('down_move-up')) {
        this.jsm.downMoveUp()
        this.jsm.upHover()
      }
    },
    onclick() {
      if (this.jsm.can('hover-click')) {
        this.jsm.hoverClick()
        if (this.eventProps.selectable) { // 可被点击选中物体
          this.jsm.clickSelect()
          // 选中uuid
          this.selectUuid = this.uuid
        } else {
          this.jsm.clickHover()
        }
      }
    },
    onMouseMove(e) {
      if (this.jsm.can('hover-hover_move')) {
        this.jsm.hoverHoverMove(e)
      } else if (this.jsm.can('hover_move-double')) {
        this.jsm.hoverMoveDouble(e)
      } else if (this.jsm.can('hover_down-down_move')) {
        this.jsm.hoverDownDownMove(e)
        this.mouseMoveFun(e)
      } else if (this.jsm.can('down_move-double')) {
        this.jsm.downMoveDouble(e)
        this.mouseMoveFun(e)
      }
    },
    onSelectChange() {
      console.log(this.jsm.state)
      if (this.jsm.can('select-free')) {
        this.jsm.selectFree()
      }
    },
    mouseMoveFun(e) {
      if (this.eventProps.draggable) {
        this.$refs['parentNode'].style.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(this.$refs['parentNode'].style.left.replace('px', '')) + 'px'
        this.$refs['parentNode'].style.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(this.$refs['parentNode'].style.top.replace('px', '')) + 'px'
      }
    },
    // ---------------------状态改变的方法
    jsmHover() {
      // this.$refs['text'].style.color = '#ff0000'
    },
    jsmFree() {
      // this.$refs['text'].style.color = '#000000'
    },
    jsmDown() {
      // this.$refs['text'].style.color = '#00ff00'
    },
    jsmUp() {
      // this.$refs['text'].style.color = '#ff0000'
    },
    jsmClick() {
      console.log('我点击了')
      selectObjectSubject.next(this.uuid)
    }
  }
}

</script>
<style lang='scss' scoped>
</style>
