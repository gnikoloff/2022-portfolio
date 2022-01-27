import { vec4 } from 'gl-matrix'
import { Action } from 'redux'
import { easeType } from './lib/hwoa-rang-anim/dist'
import {
  BoxGeometry,
  PlaneGeometry,
  ShaderDefineValue,
  UniformValue,
} from './lib/hwoa-rang-gl2'
import View from './view'

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
  tech: string
  url: string
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
  texWidth?: number
  fontSize?: number
  textAlign?: CanvasTextAlign
  textColor?: string | CanvasGradient | CanvasPattern
  transparent?: boolean
  supportHover?: boolean
}

export interface EnvBoxProps {
  width?: number
  height?: number
  depth?: number
}

export interface CubeProps {
  geometry: BoxGeometry
  name?: string
  solidColor?: vec4
  side?: GLenum
}

export interface ViewProps {
  cubeGeometry: BoxGeometry
  labelGeometry: PlaneGeometry
  openButtonGeometry: PlaneGeometry
  name: string
  project?: Project
  hasLabel?: boolean
  externalURL?: string
  interactable?: boolean
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

export interface RowTransitionProps {
  node: View | View[]
  visible: boolean
  durationMS?: number
  easeName?: easeType
}

export interface CameraTransitionProps {
  newX: number
  newY: number
  newZ: number
  positionDelayMS?: number
  positionTweenDurationMS?: number
  positionTweenEaseName?: easeType
  newLookAtX?: number
  newLookAtY?: number
  newLookAtZ?: number
  lookAtDelayMS?: number
  lookAtTweenDurationMS?: number
  lookAtTweenEaseName?: easeType
}
