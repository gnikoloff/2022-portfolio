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

export interface GeometryProps {
  geometry: RoundBoxGeometry
}

export interface ViewProps extends GeometryProps {
  uid: string
}

export interface ActionPayload extends Action {
  payload: any
}
