import { ActionPayload, Project } from '../types'

const SET_PROJECTS = 'projects/SET_PROJECTS'

export interface ProjectsState {
  projects: Project[]
}

const initialState = {}

const projects = (state = initialState, action: ActionPayload) => {
  switch (action.type) {
    case SET_PROJECTS: {
      return {
        ...state,
        projects: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export const setProjects = (projects: Project[]) => ({
  type: SET_PROJECTS,
  payload: projects,
})

export default projects
