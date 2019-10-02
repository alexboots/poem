import React, { useEffect, useState, useReducer, useRef } from 'react'
import axios from 'axios'

import FaArrowCircleLeft from 'react-icons/lib/fa/arrow-circle-left'
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right'

import { DebounceInput } from 'react-debounce-input'

import './App.css'

const initialState = {
  search: '',
  poem: {title: '', lines: [], author: ''},
  poems: [],
  viewingPoem: 0,
  isFetching: false,
  error: '',
}

const SEARCH_CHANGED = 'SEARCH_CHANGED'
const POEM_CHANGED = 'POEM_CHANGED'
const POEMS_CHANGED = 'POEMS_CHANGED'
const VIEWING_POEM_NUMBER = 'VIEWING_POEM_NUMBER'

const GET_POEMS_REQUESTED = 'GET_POEMS_REQUESTED'
const GET_POEMS_SUCCESS = 'GET_POEMS_SUCCESS'
const GET_POEMS_FAILED = 'GET_POEMS_FAILED'

function poemReducer(state, action) {
  switch (action.type) {
    case SEARCH_CHANGED:
      return { ...state, search: action.payload }
    case POEM_CHANGED:
      return { ...state, viewingPoem: 2, poem: 'error' }
    case POEMS_CHANGED:
      return {
        ...state,
        poems: action.payload,
        viewingPoem: 0,
        poem: {
          title: action.payload[0].title,
          author: action.payload[0].author,
          lines: action.payload[0].lines,
        },
        isFetching: false,
      }

    case GET_POEMS_REQUESTED:
      return { ...state, isFetching: true, error: '' }
    case GET_POEMS_FAILED:
      return { ...state, error: action.payload, isFetching: false }
    default:
      return initialState
  }
}

const BrowsePoems = ({
  numberOfPoems,
  viewingPoem,
  handlePrev,
  handleNext
}) => {
  return (
    <div className="poem-arrows">
      <FaArrowCircleLeft
        className={ `arrow ${viewingPoem === 0 ? 'hide-arrow' : null}`}
        onClick={handlePrev}
      />
      <div className="poem-number">{viewingPoem + 1} of {numberOfPoems}</div>
      <FaArrowCircleRight
        className={ `arrow ${viewingPoem === numberOfPoems - 1 ? 'hide-arrow' : null}`}
        onClick={handleNext}
      />
    </div>
  )
}

function App() {
  const [state, dispatch] = useReducer(poemReducer, initialState)

  useEffect(() => {
    const searchTerm = encodeURIComponent(state.search)
    const source = axios.CancelToken.source()

    if(searchTerm) {
      dispatch({ type: GET_POEMS_REQUESTED })
      axios.get(`http://poetrydb.org/lines/${searchTerm}/.json`).then(response => {
        if(response && response.data.status === 404) {
          dispatch({ type: GET_POEMS_FAILED, payload: 'No poems for this search term' })
        } else if(response && response.data.length) {
          console.log('hi');
          dispatch({ type: POEMS_CHANGED, payload: response.data })
        }
      })
      .catch(error => {
        dispatch({ type: GET_POEMS_FAILED, payload: error.toString() })
      })
      .finally(() => {
        // setLoading(false)
      })
    }

    return () => {
      source.cancel()
    }
  }, [state.search])

  const handlePrev = () => {
    // setviewingPoem(currentNumver => currentNumver - 1)
    // setPoemLines(poemsReceived[viewingPoem - 1].lines)
    // setPoemInfo({
    //   author: poemsReceived[viewingPoem - 1].author,
    //   title: poemsReceived[viewingPoem - 1].title,
    // })
  }

  const handleNext = () => {
    // setviewingPoem(currentNumver => currentNumver + 1)
    // setPoemLines(poemsReceived[viewingPoem + 1].lines)
    // setPoemInfo({
    //   author: poemsReceived[viewingPoem + 1].author,
    //   title: poemsReceived[viewingPoem + 1].title,
    // })
  }

  return (
    <div className="app-body">
      <div className="tagline">
        Enter a word or two and we'll find you some poems
      </div>

      <DebounceInput
        placeholder="word(s)"
        minLength={2}
        debounceTimeout={800}
        onChange={e => dispatch({ type: SEARCH_CHANGED, payload: e.target.value }) }
        disabled={state.isFetching}
      />

      {state.isFetching && `Finding you poems...`}

      <span className="error">{state.error && `Oh no: ${state.error}.`}</span>

      { !state.isFetching && state.poems.length > 1 &&
        <BrowsePoems
          numberOfPoems={state.poems.length}
          viewingPoem={state.viewingPoem}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      }

      <div>
        <h1>{state.poem.title}</h1>
        <h2>{state.poem.author}</h2>
      </div>
      <div className="poem-lines">
        { state.poem.lines.map((line, index) => <div key={index}>{line}</div>) }
      </div>
      { state.poems.length === 0 && !state.isFetching && state.search && <div>No Poems Found :(</div>}

    </div>
  );
}

export default App;
