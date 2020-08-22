import { MapState } from '../controllers/map-controller'
import { FOV, NEAR, FAR } from '../utils/constants'
import { getCameraPositionFromViewState, mercatorXfromLng, mercatorYfromLat } from '../utils/mercator'
// eslint-disable-next-line
import { getViewMatrix, getProjectionMatrix,getProjectionParameters } from 'viewport-mercator-project'
// eslint-disable-next-line
import { Scene, Mesh, PlaneBufferGeometry, PerspectiveCamera, WebGLRenderer, DoubleSide, MeshBasicMaterial, AxesHelper, TextureLoader, Matrix4, Vector3 ,Group} from 'three'
const StateMachine = require('javascript-state-machine')

export default class City {
  constructor(domElement) {
    this.width = domElement.clientWidth
    this.height = domElement.clientHeight
    this.domElement = domElement
    this.jsm = new StateMachine({
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
  init() {
    this.mapState = new MapState({ width: this.width, height: this.height, zoom: 14 })
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(FOV, this.width / this.height, NEAR, FAR)
    this.camera.up.set(0, 0, 1)
    this.earth = new Group()
    this.scene.add(this.earth)
    // this.earth.position.set(EARTH_CIRCUMFERENCE / 2, EARTH_CIRCUMFERENCE / 2, 0)
    this.renderer = new WebGLRenderer({
      canvas: this.domElement,
      alpha: false,
      antialias: true
    })
    this.renderer.setSize(this.width, this.height)
    this.test()
    this.render()
    this.initEvent()
  }
  initEvent() {
    this.domElement.addEventListener('mouseover', (e) => {
      this.onHover(e)
    })
    this.domElement.addEventListener('mousedown', (e) => {
      console.log('mousedown')
      e.preventDefault()
      e.stopPropagation()
      this.onMouseDown(e)
    })
    this.domElement.addEventListener('mousemove', (e) => {
      this.onMouseMove(e)
    })
    this.domElement.addEventListener('mouseup', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onMouseUp(e)
    })
    this.domElement.addEventListener('click', (e) => {
      console.log('click')
      e.preventDefault()
      e.stopPropagation()
    })
  }
  render() {
    window.requestAnimationFrame(this.render.bind(this))
    let cameraPos = getCameraPositionFromViewState(this.mapState._viewportProps)
    this.camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2])
    this.renderer.render(this.scene, this.camera)
    // console.log(getProjectionParameters(this.mapState._viewportProps))
    // console.log(getProjectionMatrix(this.mapState._viewportProps), getViewMatrix(this.mapState._viewportProps))
    // console.log(getViewMatrix(this.mapState._viewportProps))
    this.translate = [mercatorXfromLng(this.mapState._viewportProps.longitude), mercatorYfromLat(this.mapState._viewportProps.latitude), 0]
    // const l = new Matrix4().makeTranslation(this.translate[0], this.translate[1], this.translate[2])
    // console.log('three.camera', this.camera.projectionMatrix.elements)
  }
  test() {
    // 测试mesh
    this.mesh = new Mesh(new PlaneBufferGeometry(1000, 1000), new MeshBasicMaterial({ color: '#ff0000', side: DoubleSide, map: new TextureLoader().load('./static/img/building-wallpaper.jpg') }))
    this.earth.add(this.mesh)
    let cameraPos = getCameraPositionFromViewState(this.mapState._viewportProps)
    this.mesh.position.set(cameraPos[0], cameraPos[1], cameraPos[2])
    this.mesh.position.z = 0
    let axesHelper = new AxesHelper(50)
    this.scene.add(axesHelper)
    // console.log(this.mapState.)
  }
  // 一些事件
  onHover(e) {
    if (this.jsm.can('free-hover')) {
      this.jsm.freeHover()
    }
  }
  onMouseOut() {
    if (this.jsm.can('hover-free')) {
      this.jsm.hoverFree()
    } else if (this.jsm.can('hover_move-free')) {
      this.jsm.hoverMoveFree()
    } else if (this.jsm.can('down_move-free')) { // 移动太快跟不上了
      this.jsm.downMoveFree()
    }
  }
  onMouseDown(e) {
    console.log(e.button)
    if (this.jsm.can('hover-hover_down')) {
      this.jsm.hoverHoverDown()
      let pos = [e.offsetX, e.offsetY]
      this.mapState = this.mapState.panStart({ pos: pos })
    }
  }
  onMouseUp(e) {
    if (this.jsm.can('hover_down-up')) {
      this.jsm.hoverDownUp()
      this.jsm.upHover()
    }
    if (this.jsm.can('down_move-up')) {
      this.jsm.downMoveUp()
      this.jsm.upHover()
      let pos = [e.offsetX, e.offsetY]
      this.mapState = this.mapState.panStart({ pos: pos })
    }
  }
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
  }
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
    }
  }
  onSelectChange() {
    console.log(this.jsm.state)
    if (this.jsm.can('select-free')) {
      this.jsm.selectFree()
    }
  }
  mouseMoveFun(e) {
    console.log('mouseMoveFun')
    let pos = [e.offsetX, e.offsetY]
    this.mapState = this.mapState.pan({ pos: pos })
    // if (this.eventProps.draggable) {
    //   this.$refs['text'].style.left = e.offsetX - this.mouseDownXY.x + Number.parseFloat(this.$refs['text'].style.left.replace('px', '')) + 'px'
    //   this.$refs['text'].style.top = e.offsetY - this.mouseDownXY.y + Number.parseFloat(this.$refs['text'].style.top.replace('px', '')) + 'px'
    // }
  }
  // ---------------------状态改变的方法
  jsmHover() {
    // this.$refs['text'].style.color = '#ff0000'
  }
  jsmFree() {
    // this.$refs['text'].style.color = '#000000'
  }
  jsmDown() {
    // this.$refs['text'].style.color = '#00ff00'
  }
  jsmUp() {
    // this.$refs['text'].style.color = '#ff0000'
  }
  jsmClick(e) {
  }
}
