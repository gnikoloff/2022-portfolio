import { vec4 } from 'gl-matrix'
import { Action } from 'redux'
import { RoundBoxGeometry } from './lib/hwoa-rang-gl2/dist'

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

export interface RoundCubeProps {
  geometry: RoundBoxGeometry
  solidColor?: vec4
}

export interface ViewProps extends RoundCubeProps {
  uid: string
}

export interface ActionPayload extends Action {
  payload: any
}
