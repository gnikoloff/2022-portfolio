import { vec4 } from 'gl-matrix'
import { Action } from 'redux'
import {
  BoxGeometry,
  PlaneGeometry,
  ShaderDefineValue,
  UniformValue,
} from './lib/hwoa-rang-gl2/dist'

export interface UBOVariable {
  offset: number
  index: number
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

export interface QuadProps {
  geometry: PlaneGeometry
  uniforms?: { [name: string]: { type: GLuint; value: UniformValue } }
  defines?: { [name: string]: ShaderDefineValue }
  name?: string
}

export interface LabelProps extends QuadProps {
  name?: string
  label: string
}

export interface CubeProps {
  geometry: BoxGeometry
  name?: string
  solidColor?: vec4
}

export interface ViewProps {
  cubeGeometry: BoxGeometry
  labelGeometry: PlaneGeometry
  name: string
  project?: Project
  hasLabel?: boolean
}

export interface SingleViewProps {
  imageGeometry: BoxGeometry
  descGeometry: BoxGeometry
  project: Project
  name: string
}

export interface ActionPayload extends Action {
  payload: any
}
