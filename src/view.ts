import { BoundingBox, SceneNode } from './lib/hwoa-rang-gl2/dist'
import RoundCube from './meshes/round-cube'
import { ViewProps } from './types'

export default class View extends SceneNode {
  visible = false
  open = true

  get AABB(): BoundingBox {
    const projectThumb = this.findChild((child) =>
      child instanceof RoundCube ? child : null,
    ) as RoundCube
    return projectThumb?.AABB
  }

  get sampleProgram(): WebGLProgram {
    const projectThumb = this.findChild((child) =>
      child instanceof RoundCube ? child : null,
    ) as RoundCube
    return projectThumb.program
  }

  constructor(gl: WebGL2RenderingContext, { geometry, uid }: ViewProps) {
    super(uid)
    const meshWrapperNode = new SceneNode('mesh-wrapper')
    meshWrapperNode.traversable = false
    meshWrapperNode.setParent(this)

    const projectThumb = new RoundCube(gl, { geometry })
    projectThumb.setParent(meshWrapperNode)
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
