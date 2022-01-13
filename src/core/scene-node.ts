import { mat4 } from 'gl-matrix'
import { traverseCallback } from '../types'
import { Transform } from './transform'

export default class SceneNode extends Transform {
  parentNode: SceneNode | null = null
  children: SceneNode[] = []

  worldMatrix = mat4.create()
  normalMatrix = mat4.create()

  uid!: string

  protected _levelIndex = 0

  get levelIndex(): number {
    if (this._levelIndex) {
      return this._levelIndex
    }
    let parentNode = this.parentNode
    while (parentNode) {
      this._levelIndex++
      parentNode = parentNode.parentNode
    }
    return this._levelIndex
  }

  setParent(parentNode: SceneNode | null = null): this {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this)
      if (idx >= 0) {
        this.parentNode.children.splice(idx, 1)
      }
    }
    if (parentNode) {
      parentNode.children.push(this)
    }
    this.parentNode = parentNode
    return this
  }

  updateWorldMatrix(parentWorldMatrix: mat4 | null = null): this {
    if (this.shouldUpdate) {
      this.updateModelMatrix()
    }
    if (parentWorldMatrix) {
      mat4.mul(this.worldMatrix, parentWorldMatrix, this.modelMatrix)
    } else {
      mat4.copy(this.worldMatrix, this.modelMatrix)
    }
    mat4.invert(this.normalMatrix, this.worldMatrix)
    mat4.transpose(this.normalMatrix, this.normalMatrix)
    this.children.forEach((child) => {
      child.updateWorldMatrix(this.worldMatrix)
    })
    return this
  }

  traverse(callback: traverseCallback, depth = 0) {
    callback(this, depth)
    depth++
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      child.traverse(callback, depth)
    }
  }

  findChild(uid: string): SceneNode | null {
    if (this.uid === uid) {
      return this
    }
    let outNode: SceneNode | null = null
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if ((outNode = child.findChild(uid))) {
        break
      }
    }
    return outNode
  }

  render(): void {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].render()
    }
  }
}
