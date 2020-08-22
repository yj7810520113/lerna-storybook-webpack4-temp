<template>
  <div
    :ref="'text'"
    :style="style"
    style="top:40px"
    @mouseover.stop.prevent="onHover"
    @mouseout.stop.prevent="onMouseOut"
    @mousedown.stop.prevent="onMouseDown"
    @mouseup.stop.prevent="onMouseUp"
    @mousemove.stop.prevent="onMouseMove"
    @click.prevent.stop="onclick"
  >
    可被选择物体
    <template
      v-for="(data,index) of selectListData"
    >
      <Select
        :key="index"
        :dom-style="data"
        :uuid="data.uuid"
      />
    </template>
  </div>
</template>

<script>
import { selectObjectSubject } from '../bus/event'
import Select from '../object3d/select'
const StateMachine = require('javascript-state-machine')

/**
 *
 *
 * @param {*} context 当前上下文比如你要基于哪个组件来向下寻找，一般都是基于当前的组件，也就是传入 this
 * @param {*} componentName 要找到的组件名称
 * @returns 所有组件实例的list
 */
function findComponentsDownward(context, componentName) {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child)
    const foundChilds = findComponentsDownward(child, componentName)
    return components.concat(foundChilds)
  }, [])
}
export default {
  name: 'SelectLayer',
  components: {
    Select
  },
  data() {
    return {
      selectUuid: 0,
      uuid: 2,
      selectListData: [
        { top: '0px', uuid: 10 },
        { top: '50px', uuid: 11 },
        { top: '150px', uuid: 12 },
        { top: '200px', uuid: 13 },
        { top: '250px', uuid: 14 }
      ],
      eventProps: {
        draggable: false,
        selectable: true
      },
      style: {
        position: 'absolute',
        userSelect: 'none',
        color: '#000000',
        left: '0px',
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
            console.log(e)
          },
          onFreeHover: () => {
            this.jsmHover()
          },
          onHoverFree: () => {
            this.jsmFree()
          },
          onHoverHoverMove: () => {},
          onHoverClick: (trans, e) => { this.jsmClick(e) },
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
  created() {
    selectObjectSubject.subscribe((d) => {
      if (d !== this.uuidd) {
        this.onSelectChange()
      }
    })
    setTimeout(() => {
      console.log('改变子节点位置了')
      this.selectListData[0].top = '600px'
    }, 2000)
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
    onclick(e) {
      if (this.jsm.can('hover-click')) {
        this.jsm.hoverClick(e)
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
      console.log(e)
      console.log(findComponentsDownward(this, 'SelectOject3d')[0].$el === e.srcElement)
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
        this.$refs['text'].style.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(this.$refs['text'].style.left.replace('px', '')) + 'px'
        this.$refs['text'].style.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(this.$refs['text'].style.top.replace('px', '')) + 'px'
      }
    },
    // ---------------------状态改变的方法
    jsmHover() {
      this.$refs['text'].style.color = '#ff0000'
    },
    jsmFree() {
      this.$refs['text'].style.color = '#000000'
    },
    jsmDown() {
      this.$refs['text'].style.color = '#00ff00'
    },
    jsmUp() {
      this.$refs['text'].style.color = '#ff0000'
    },
    jsmClick(e) {
      console.log('我点击了')
      selectObjectSubject.next(this.uuid)
      // 测试点击节点
      let com = this.findComponent(e)
      com.onClick(e)
      // 测试子节点点击
    },
    // 找到子节点
    findComponent(e) {
      let childrens = findComponentsDownward(this, 'SelectOject3d')
      for (let child of childrens) {
        if (child.$el === e.srcElement) {
          return child
        }
      }
    }
  }
}

</script>
<style lang='scss' scoped>
</style>
