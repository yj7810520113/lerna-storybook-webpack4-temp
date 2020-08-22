import assert from '../utils/assert'
import { Vector3 } from 'three'
export default class ViewState {
  constructor(opts) {
    const {
      width, // Width of viewport
      height, // Height of viewport

      // Position and orientation
      position = [0, 0, 0] // typically in meters from anchor point
    } = opts

    assert(Number.isFinite(width), '`width` must be supplied')
    assert(Number.isFinite(height), '`height` must be supplied')

    this._viewportProps = this._applyConstraints(
      Object.assign({}, opts, {
        position: new Vector3(...position)
      })
    )
  }

  getViewportProps() {
    return this._viewportProps
  }
}
