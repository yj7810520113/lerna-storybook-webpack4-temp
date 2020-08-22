import assert from '../utils/assert'
import WebMercatorViewport, { normalizeViewportProps } from 'viewport-mercator-project'
import { clamp } from '../utils/math'
import ViewState from './view-state'

const DEFAULT_STATE = {
  bearing: 0,
  pitch: 0,
  longitude: 0,
  latitude: 0,
  zoom: 14,
  altitude: 1.5
}
const MAP_LIMIT = {
  maxPitch: 85,
  minPitch: 0,
  minZoom: 0,
  maxZoom: 20
}
export class MapState extends ViewState {
  constructor({
    width = 1000,
    height = 1000,
    latitude = DEFAULT_STATE.latitude,
    longitude = DEFAULT_STATE.longitude,
    zoom = DEFAULT_STATE.zoom,
    bearing = DEFAULT_STATE.bearing,
    pitch = DEFAULT_STATE.pitch,
    altitude = DEFAULT_STATE.altitude,
    maxZoom = MAP_LIMIT.maxZoom,
    minZoom = MAP_LIMIT.minZoom,
    maxPitch = MAP_LIMIT.maxPitch,
    minPitch = MAP_LIMIT.minPitch,

    /** Interaction states, required to calculate change during transform */
    /* The point on map being grabbed when the operation first started */
    startPanLngLat,

    /* Center of the zoom when the operation first started */
    startZoomLngLat,

    /** Bearing when current perspective rotate operation started */
    startBearing,

    /** Pitch when current perspective rotate operation started */
    startPitch,

    /** Zoom when current zoom operation started */
    startZoom

    /** Zoom when current zoom operation started */
  } = {}) {
    super({
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
      altitude,
      maxZoom,
      minZoom,
      maxPitch,
      minPitch
    })
    assert(Number.isFinite(longitude), '`longitude` must be supplied')
    assert(Number.isFinite(latitude), '`latitude` must be supplied')
    assert(Number.isFinite(zoom), '`zoom` must be supplied')
    assert(Number.isFinite(width), '`width` must be supplied')
    assert(Number.isFinite(height), '`height` must be supplied')
    this._interactiveState = {
      startPanLngLat,
      startZoomLngLat,
      startBearing,
      startPitch,
      startZoom
    }
  }

  /**
  * Start panning
  * @param {[Number, Number]} pos - position on screen where the pointer grabs
  */
  panStart({ pos }) {
    return this._getUpdatedState({
      startPanLngLat: this._unproject(pos)
    })
  }

  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   * @param {[Number, Number], optional} startPos - where the pointer grabbed at
   *   the start of the operation. Must be supplied of `panStart()` was not called
   */
  pan({ pos, startPos }) {
    const startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos)
    if (!startPanLngLat) {
      return this
    }

    const [longitude, latitude] = this._calculateNewLngLat({ startPanLngLat, pos })

    return this._getUpdatedState({
      longitude,
      latitude
    })
  }

  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanLngLat: null
    })
  }

  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotateStart({ pos }) {
    return this._getUpdatedState({
      startBearing: this._viewportProps.bearing,
      startPitch: this._viewportProps.pitch
    })
  }

  /**
   * Rotate
   * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
   *   change to bearing.
   * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
   *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
   */
  rotate({ deltaScaleX = 0, deltaScaleY = 0 }) {
    const { startBearing, startPitch } = this._interactiveState

    if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
      return this
    }

    const { pitch, bearing } = this._calculateNewPitchAndBearing({
      deltaScaleX,
      deltaScaleY,
      startBearing,
      startPitch
    })

    return this._getUpdatedState({
      bearing,
      pitch
    })
  }

  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startBearing: null,
      startPitch: null
    })
  }

  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({ pos }) {
    return this._getUpdatedState({
      startZoomLngLat: this._unproject(pos),
      startZoom: this._viewportProps.zoom
    })
  }

  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current center is
   * @param {[Number, Number]} startPos - the center position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({ pos, startPos, scale }) {
    assert(scale > 0, '`scale` must be a positive number')

    // Make sure we zoom around the current mouse position rather than map center
    let { startZoom, startZoomLngLat } = this._interactiveState

    if (!Number.isFinite(startZoom)) {
      // We have two modes of zoom:
      // scroll zoom that are discrete events (transform from the current zoom level),
      // and pinch zoom that are continuous events (transform from the zoom level when
      // pinch started).
      // If startZoom state is defined, then use the startZoom state;
      // otherwise assume discrete zooming
      startZoom = this._viewportProps.zoom
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos)
    }

    // take the start lnglat and put it where the mouse is down.
    assert(
      startZoomLngLat,
      '`startZoomLngLat` prop is required ' +
        'for zoom behavior to calculate where to position the map.'
    )

    const zoom = this._calculateNewZoom({ scale, startZoom })

    const zoomedViewport = new WebMercatorViewport(Object.assign({}, this._viewportProps, { zoom }))
    const [longitude, latitude] = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos })

    return this._getUpdatedState({
      zoom,
      longitude,
      latitude
    })
  }

  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomLngLat: null,
      startZoom: null
    })
  }
  _unproject(pos) {
    const viewport = new WebMercatorViewport(this._viewportProps)
    return pos && viewport.unproject(pos)
  }
  // Calculate a new lnglat based on pixel dragging position
  _calculateNewLngLat({ startPanLngLat, pos }) {
    const viewport = new WebMercatorViewport(this._viewportProps)
    return viewport.getMapCenterByLngLatPosition({ lngLat: startPanLngLat, pos })
  }
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure zoom is within specified range
    const { maxZoom, minZoom, zoom } = props
    props.zoom = clamp(zoom, minZoom, maxZoom)

    // Ensure pitch is within specified range
    const { maxPitch, minPitch, pitch } = props
    props.pitch = clamp(pitch, minPitch, maxPitch)

    Object.assign(props, normalizeViewportProps(props))

    return props
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({ deltaScaleX, deltaScaleY, startBearing, startPitch }) {
    // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
    // deltaScaleX does not need to be clamped as bearing does not have constraints.
    deltaScaleY = clamp(deltaScaleY, -1, 1)

    const { minPitch, maxPitch } = this._viewportProps

    const bearing = startBearing + 180 * deltaScaleX
    let pitch = startPitch
    if (deltaScaleY > 0) {
      // Gradually increase pitch
      pitch = startPitch + deltaScaleY * (maxPitch - startPitch)
    } else if (deltaScaleY < 0) {
      // Gradually decrease pitch
      pitch = startPitch - deltaScaleY * (minPitch - startPitch)
    }

    return {
      pitch,
      bearing
    }
  }
  // Calculates new zoom
  _calculateNewZoom({ scale, startZoom }) {
    const { maxZoom, minZoom } = this._viewportProps
    const zoom = startZoom + Math.log2(scale)
    return clamp(zoom, minZoom, maxZoom)
  }
  _getUpdatedState(newProps) {
    // Update _viewportProps
    return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps))
  }
}
