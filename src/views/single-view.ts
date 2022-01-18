import { Project, SingleViewProps } from '../interfaces'
import { SceneNode } from '../lib/hwoa-rang-gl2/dist'
import Cube from '../meshes/cube'

export default class SingleView extends SceneNode {
  visible = true

  project: Project
  projectImageNode: Cube
  projectDescNode: Cube

  static MESH_WRAPPER_NAME = 'mesh-wrapper'

  drawDescription() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
  }

  constructor(
    gl: WebGL2RenderingContext,
    { imageGeometry, descGeometry, project, name }: SingleViewProps,
  ) {
    super(name)
    this.project = project

    const meshWrapperNode = new SceneNode(SingleView.MESH_WRAPPER_NAME)
    meshWrapperNode.setParent(this)

    this.projectImageNode = new Cube(gl, { geometry: imageGeometry, name })
    this.projectImageNode.setPosition([-2.05, 0, 0])
    this.projectImageNode.setParent(meshWrapperNode)

    this.projectDescNode = new Cube(gl, { geometry: descGeometry, name })
    this.projectDescNode.setPosition([4, 1, 0])
    this.projectDescNode.setParent(meshWrapperNode)
  }
  render(): void {
    if (!this.visible) {
      return
    }
    this._children.forEach((child) => child.render())
  }
}
