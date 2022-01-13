import SceneNode from './core/scene-node'
import ProjectThumb from './meshes/project-thumb'
import { BoundingBox, ViewProps } from './types'

export default class View extends SceneNode {
  uid: string
  visible = false

  get AABB(): BoundingBox {
    const projectThumb = this.children[0] as ProjectThumb
    return projectThumb.AABB
  }

  constructor(gl: WebGL2RenderingContext, { geometry, uid }: ViewProps) {
    super()
    this.uid = uid
    const projectThumb = new ProjectThumb(gl, { geometry })
    projectThumb.setParent(this)
  }

  reveal() {
    this.setScale([1, 1, 1])
    this.visible = true
  }

  hide() {
    this.setScale([0, 0, 0])
    this.visible = false
  }

  render(): void {
    if (!this.visible) {
      return
    }
    this.children.forEach((child) => child.render())
  }
}
