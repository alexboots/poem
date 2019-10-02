import React, { useEffect, useState, useReducer, useRef } from 'react'
import axios from 'axios'

import FaArrowCircleLeft from 'react-icons/lib/fa/arrow-circle-left'
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right'

import { DebounceInput } from 'react-debounce-input'

import './App.css'

const initialState = {
  search: '',
  poemLines: [],
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

const BrowsePoems = ({
  numberOfPoems,
  viewingPoemNumber,
  handlePrev,
  handleNext
}) => {
  return (
    <div className="poem-arrows">
      <FaArrowCircleLeft
        className={ `arrow ${viewingPoemNumber === 0 ? 'hide-arrow' : null}`}
        onClick={handlePrev}
      />
      <div className="poem-number">{viewingPoemNumber + 1} of {numberOfPoems}</div>
      <FaArrowCircleRight
        className={ `arrow ${viewingPoemNumber === numberOfPoems - 1 ? 'hide-arrow' : null}`}
        onClick={handleNext}
      />
    </div>
  )
}

function App() {
  const [search, setSeach] = useState('')
  const [poemLines, setPoemLines] = useState([])
  const [poemInfo, setPoemInfo] = useState({author: '', title: ''})
  const [loading, setLoading] = useState(false)
  const [numberOfPoems, setNumberOfPoems] = useState(0)
  const [noPoemsFound, setNoPoemsFound] = useState(false)
  const [viewingPoemNumber, setViewingPoemNumber] = useState(0)
  const [catchError, setCatchError] = useState('')

  const [poemsReceived, setPoemsReceived] = useState([])

  const [state, dispatch] = useReducer(poemReducer, initialState)

  useEffect(() => {
    console.log('We inside effect');
    const searchTerm = encodeURIComponent(search)
    const source = axios.CancelToken.source()

    if(searchTerm) {
      setLoading(true)
      setViewingPoemNumber(0)

      axios.get(`http://poetrydb.org/lines/${searchTerm}/.json`).then(response => {
        if(response && response.data.status === 404) {
          setNoPoemsFound(true)
        } else if(response && response.data.length) {
          // Make everything  pull from this instead of so segmented
          setPoemsReceived(response.data)
          setPoemLines(response.data[0].lines)
          setNumberOfPoems(response.data.length)
          setNoPoemsFound(false)
          setPoemInfo({
            author: response.data[0].author,
            title: response.data[0].title,
          })
        }
      })
      .catch(error => setCatchError(error.toString()))
      .finally(() => setLoading(false))
    }

    return () => {
      source.cancel()
    }
  }, [search])

  const handlePrev = () => {
    setViewingPoemNumber(currentNumver => currentNumver - 1)
    setPoemLines(poemsReceived[viewingPoemNumber - 1].lines)
    setPoemInfo({
      author: poemsReceived[viewingPoemNumber - 1].author,
      title: poemsReceived[viewingPoemNumber - 1].title,
    })
  }

  const handleNext = () => {
    setViewingPoemNumber(currentNumver => currentNumver + 1)
    setPoemLines(poemsReceived[viewingPoemNumber + 1].lines)
    setPoemInfo({
      author: poemsReceived[viewingPoemNumber + 1].author,
      title: poemsReceived[viewingPoemNumber + 1].title,
    })
  }

  return (
    <div className="app-body">
      <div className="tagline">Enter a word or two and we'll find you some poems</div>

      <DebounceInput
        placeholder="word(s)"
        minLength={2}
        debounceTimeout={800}
        onChange={e => setSeach(e.target.value) }
        disabled={loading}
      />

      {loading && `Finding you poems...`}

      <span className="error">{ catchError && `Oh no: ${catchError}. Tell @alexboots this happened.` }</span>

      { !loading && numberOfPoems > 1 &&
        <BrowsePoems
          numberOfPoems={numberOfPoems}
          viewingPoemNumber={viewingPoemNumber}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      }

      <div>
        <h1>{poemInfo.title}</h1>
        <h2>{poemInfo.author}</h2>
      </div>
      <div className="poem-lines">
        { poemLines.map((line, index) => <div key={index}>{line}</div>) }
      </div>
      { noPoemsFound && <div>No Poems Found :(</div>}

    </div>
  );
}

export default App;
