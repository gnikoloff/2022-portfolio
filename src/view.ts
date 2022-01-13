import { BoundingBox, SceneNode } from './lib/hwoa-rang-gl2/dist'
import ProjectThumb from './meshes/project-thumb'
import { ViewProps } from './types'

export default class View extends SceneNode {
  visible = false

  get AABB(): BoundingBox {
    const projectThumb = this.children[0].children[0] as ProjectThumb
    return projectThumb.AABB
  }

  get sampleProgram(): WebGLProgram {
    return this.children[0].children[0].program
  }

  get childrenWrapperNode(): View {
    return this.children[1]
  }

  constructor(gl: WebGL2RenderingContext, { geometry, uid }: ViewProps) {
    super(uid)
    const meshWrapperNode = new SceneNode('mesh-wrapper')
    meshWrapperNode.traversable = false
    const projectThumb = new ProjectThumb(gl, { geometry })
    projectThumb.setParent(meshWrapperNode)
    meshWrapperNode.setParent(this)

    // const viewContainerNode = new SceneNode('view-wrapper')
    // viewContainerNode.setParent(this)
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
