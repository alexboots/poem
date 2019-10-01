import React, { useEffect, useState, useReducer } from 'react'
import axios from 'axios'

import FaArrowCircleLeft from 'react-icons/lib/fa/arrow-circle-left'
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right'

import { DebounceInput } from 'react-debounce-input'

import './App.css'

const initialState = {
  search: '',
  poemLines: [],
  poemSelected: [],
  numberOfPoems: 0,
  noPoemsFound: false,
  viewingPoemNumber: 0,
  catchError: '',
}

function poemReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      return initialState
  }
}

const BrowsePoems = ({numberOfPoems, viewingPoemNumber, handlePrev, handleNext}) => {
  return (
    <div className="poem-arrows">
      <FaArrowCircleLeft className="arrow" />
      <div className="poem-number">{viewingPoemNumber + 1}</div>
      <FaArrowCircleRight className="arrow" />
    </div>
  )
}

function App() {
  const [search, setSeach] = useState('')
  const [poemLines, setPoemLines] = useState([])
  const [loading, setLoading] = useState('')
  const [poemSelected, setPoemSelected] = useState([])
  const [numberOfPoems, setNumberOfPoems] = useState(0)
  const [noPoemsFound, setNoPoemsFound] = useState(false)
  const [viewingPoemNumber, setViewingPoemNumber] = useState(0)
  const [catchError, setCatchError] = useState('')

  const [state, dispatch] = useReducer(poemReducer, initialState)

  useEffect(() => {
    const searchTerm = encodeURIComponent(search)
    if(searchTerm) {
      axios.get(`http://poetrydb.org/lines/${searchTerm}/.json`).then(response => {
        if(response && response.data.status === 404) {
          setNoPoemsFound(true)
        } else if(response && response.data.length) {
          setPoemLines(response.data[0].lines)
          setNumberOfPoems(response.data.length)
          setNoPoemsFound(false)
        }
      })
      .catch(error => {
        setCatchError(error.toString())
      })
    }
  }, [search])

  const handlePrev = () => {
    console.log('handlePrev')
  }

  const handleNext = () => {
    console.log('handleNext')
  }


  return (
    <div className="app-body">
      <div className="tagline">Seach a word or two and we'll find you a poem</div>

      <DebounceInput
        placeholder="word(s)"
        minLength={2}
        debounceTimeout={800}
        onChange={e => setSeach(e.target.value) }
        disabled={false}
      />

      <span className="error">{ catchError && `Oh no: ${catchError}. Bug @alexboots about it.` }</span>

      { numberOfPoems > 1 &&
        <BrowsePoems
          numberOfPoems={numberOfPoems}
          viewingPoemNumber={viewingPoemNumber}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      }

      <div className="poem-lines">
        { poemLines.map((line, index) => <div key={index}>{line}</div>) }
      </div>
      { noPoemsFound && <div>No Poems Found :(</div>}

    </div>
  );
}

export default App;
