import { mat4, vec3 } from 'gl-matrix'
import { Action } from 'redux'
import SceneNode from './core/scene-node'

export type traverseCallback = (node: SceneNode, depthLevel: number) => void

export interface UBOVariable {
  offset: number
  index: number
}

export interface RoundBox {
  width?: number
  height?: number
  depth?: number
  radius?: number
  div?: number
}

export interface RoundBoxGeometry {
  width: number
  height: number
  depth: number
  vertexCount: number
  vertexStride: number
  interleavedArray: Float32Array
  indicesArray: Int16Array
}

export interface Plane {
  width?: number
  height?: number
  widthSegments?: number
  heightSegments?: number
}

export interface BoundingBox {
  min: vec3
  max: vec3
}

interface ProjectDate {
  first: string
  last: string
}

interface ProjectImage {
  url: string
  width: number
  height: number
}

export interface Project {
  uid: string
  title: string
  type: string
  year: number
  date: ProjectDate
  image: ProjectImage
}

export interface ProjectGroup {
  [key: string]: Project[]
}

export interface GeometryProps {
  geometry: RoundBoxGeometry
}

export interface ViewProps extends GeometryProps {
  uid: string
}

export interface ActionPayload extends Action {
  payload: any
}
