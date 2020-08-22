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
  props: {
    hoverQueue: {
      type: Array,
      default: () => []
    },
    selectQueue: {
      type: Array,
      default: () => []
    }
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
      // selectQueue: [],
      // hoverQueue: [],
      mouseDownXY: {
        x: 0, y: 0
      },
      jsm: new StateMachine({
        init: 'free',
        transitions: [
          { name: 'free-hover', from: 'free', to: 'hover' },
          { name: 'hover-free', from: 'hover', to: 'free' }, // 鼠标移出
          { name: 'hover-hover_move', from: 'hover', to: 'hoverMove' },
          { name: 'hover-click', from: ['hover', 'free'], to: 'click' },
          { name: 'click-hover', from: 'click', to: 'hover' },
          { name: 'click-select', from: 'click', to: 'select' },
          { name: 'select-select_move', from: 'select', to: 'selectMove' }, // 选择状态下移动鼠标
          { name: 'select_move-select', from: 'selectMove', to: 'select' }, // 鼠标停止移动，回到选择状态
          { name: 'select-select_hover', from: 'select', to: 'selectHover' }, // 选择状态下hover
          { name: 'select_hover-select', from: 'selectHover', to: 'select' }, // 鼠标移出hover区，回到选择状态
          { name: 'select_hover-select_hover_move', from: 'selectHover', to: 'selectHoverMove' }, // 鼠标在选择状态下hover后移动了鼠标
          { name: 'select_hover_move-select_hover', from: 'selectHoverMove', to: 'selectHover' }, // 鼠标停止移动，恢复hover状态
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
          { name: 'up-free', from: 'up', to: 'free' }, // 鼠标弹起后，鼠标不在物体上，回到free状态
          { name: 'goto', from: '*', to: function(s) { return s } }
        ],
        methods: {
          onInvalidTransition: function(transition, from, to) {
            console.error(`transition not allowed from: ${from}  to: ${to}`)
            this.jsm.goto('free')
          },
          onTransition: (trans, e) => {
            console.log(trans.to)
          },
          onFreeHover: (trans, e) => {
            this.jsmHover(e)
          },
          onHoverFree: () => {
            this.jsmFree()
          },
          onHoverHoverMove: () => {},
          onHoverClick: (trans, e) => { this.jsmClick(e) },
          onClickHover: (trans, e) => { this.jsmHover(e) },
          onClickSelect: () => {},
          onSelectSelectMove: () => {},
          onSelectMoveSelect: () => {},
          onSelectSelectHover: (trans, e) => { this.jsmHover(e) },
          onSelectHoverSelect: (trans, e) => {
            // 这里不能直接调用jsmClick，因为鼠标移动到其他物体上，也会调用此transition
            // this.jsmClick(e)
          },
          onSelectFree: (trans, e) => { this.jsmFree(e) },
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
          onUpHover: (trans, e) => {
            this.jsmHover(e)
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
      // if (d !== this.uuidd) {
      this.onSelectChange(d)
      // }
    })
    setTimeout(() => {
      console.log('改变子节点位置了')
      this.selectListData[0].top = '600px'
    }, 2000)
  },
  methods: {
    onHover(e) {
      if (e.srcElement === this.$refs['text']) {
        return
      }
      if (this.jsm.can('free-hover')) {
        this.jsm.freeHover(e)
      } else if (this.jsm.can('select-select_hover')) {
        this.jsm.selectSelectHover(e)
      }
    },
    onMouseOut(e) {
      if (e.srcElement === this.$refs['text']) {
        return
      }
      if (this.jsm.can('hover-free')) {
        this.jsm.hoverFree(e)
      } else if (this.jsm.can('hover_move-free')) {
        this.jsm.hoverMoveFree(e)
      } else if (this.jsm.can('down_move-free')) { // 移动太快跟不上了
        this.jsm.downMoveFree(e)
      } else if (this.jsm.can('select_hover-select')) {
        this.jsm.selectHoverSelect(e)
      }
      this.arrayDistinct(this.hoverQueue, this.selectQueue).forEach((d) => {
        d.onFree()
      })
      this.hoverQueue.splice(0, this.hoverQueue.length)
      // this.hoverQueue.forEach((d) => {
      //   d.onFree()
      // })
      // this.hoverQueue = []
    },
    onMouseDown(e) {
      if (e.srcElement === this.$refs['text']) {
        return
      }
      this.mouseDownXY.x = e.offsetX
      this.mouseDownXY.y = e.offsetY
      if (this.jsm.can('hover-hover_down')) {
        this.jsm.hoverHoverDown(e)
      }
    },
    onMouseUp(e) {
      if (e.srcElement === this.$refs['text']) {
        return
      }
      if (this.jsm.can('hover_down-up')) {
        this.jsm.hoverDownUp(e)
        this.jsm.upHover(e)
      }
      if (this.jsm.can('down_move-up')) {
        this.jsm.downMoveUp(e)
        this.jsm.upHover(e)
      }
    },
    onclick(e) {
      if (e.srcElement === this.$refs['text']) {
        return
      }
      let com = this.findComponent(e)
      if (this.selectQueue.length !== 0) { // 说明已经有物体处在被选中状态了
        if (this.selectQueue.indexOf(com) === -1) {
          console.log('说明已经有物体处在被选中状态了')
          selectObjectSubject.next(com.uuid)
        }
      }

      if (this.jsm.can('hover-click')) {
        this.jsm.hoverClick(e)
        if (this.eventProps.selectable) { // 可被点击选中物体
          this.jsm.clickSelect(e)
          if (this.selectQueue.indexOf(com) === -1) {
            // 说明改变了目标了
            console.log(com)
            selectObjectSubject.next(com.uuid)
          }
          // 选中uuid
          // this.selectUuid = this.uuid
        } else {
          this.jsm.clickHover(e)
        }
      }
    },
    onMouseMove(e) {
      // console.log(e)
      // console.log(findComponentsDownward(this, 'SelectOject3d')[0].$el === e.srcElement)
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
      } else if (this.jsm.can('select-select_move')) {
        this.jsm.selectSelectMove(e)
        this.jsm.selectMoveSelect(e)
      }
    },
    onSelectChange(uuid) {
      console.log(uuid, this.jsm.state, this.selectQueue)
      this.selectQueue.forEach((d) => {
        if (d.uuid !== uuid) {
          d.onFree()
        }
      })
      this.selectQueue.splice(0, this.selectQueue.length)
      this.jsm.goto('free')
      if (this.jsm.can('select-free')) {
        this.jsm.selectFree()
      }
    },
    mouseMoveFun(e) {
      if (this.eventProps.draggable) {
        let com = this.findComponent(e)
        com.baseStyle.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(com.baseStyle.left.replace('px', '')) + 'px'
        com.baseStyle.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(com.baseStyle.top.replace('px', '')) + 'px'
        // this.$refs['text'].style.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(this.$refs['text'].style.left.replace('px', '')) + 'px'
        // this.$refs['text'].style.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(this.$refs['text'].style.top.replace('px', '')) + 'px'
      }
    },
    // 判断在array1中的数据不在array2中，并返回结果
    arrayDistinct(array1, array2) {
      let result = []
      array1.forEach((d) => {
        if (array2.indexOf(d) === -1) {
          result.push(d)
        }
      })
      console.log('arrayDistinct', array1, array2, result)
      return result
    },
    // ---------------------状态改变的方法
    jsmHover(e) {
      // 测试点击节点
      let com = this.findComponent(e)
      com.onHover(e)
      if (this.hoverQueue.indexOf(com) === -1) {
        this.hoverQueue.push(com)
      }
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
    jsmClick(e) {
      console.log('我点击了')
      // selectObjectSubject.next(this.uuid)
      // 测试点击节点
      if (this.eventProps.selectable) {
        let com = this.findComponent(e)
        com.onSelect(e)
        this.selectQueue.push(com)
      }
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
