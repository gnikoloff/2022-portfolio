import thunk from 'redux-thunk'
import { applyMiddleware, combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import views, { ViewState } from './views'
import ui, { UIState } from './ui'
import projects, { ProjectsState } from './projects'

export interface CombinedState {
  view: ViewState
  ui: UIState
  projects: ProjectsState
}

export default configureStore({
  reducer: combineReducers({ views, ui, projects }),
  enhancers: [applyMiddleware(thunk)],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools:
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
})
