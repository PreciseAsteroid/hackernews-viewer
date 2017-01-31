import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = 100;

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

// var url =  ${ PATH_BASE }${ PATH_SEARCH }?${ PARAM_SEARCH }${ DEFAULT_QUERY } ;
var url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}${DEFAULT_PAGE}`;
console.log(url);

// const list = [
//   {
//     title: 'React',
//     url: 'https://facebook.github.io/react/',
//     author: 'Jordan Walke',
//     num_comments: 3,
//     points: 4,
//     objectID: 0,
// },
//   {
//     title: 'Redux',
//     url: 'https://github.com/reactjs/redux',
//     author: 'Dan Abramov, Andrew Clark',
//     num_comments: 2,
//     points: 5,
//     objectID: 1,
// }];

function isSearched(searchTerm) {
  return function(item) {
    // some condition which should return true or false
    return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      // list: list,
      // result: null,
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  setSearchTopstories(result){
    const { hits, page} = result;
    const { searchKey, results} = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits,page}
      },
      isLoading: false
    });
  }

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopstories(searchTerm,page){
    this.setState({isLoading:true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response=>response.json())
      .then(result=>this.setSearchTopstories(result))
      .catch(function(err) {
          console.log(err);
          return err;
        })
  }

  componentDidMount(){
    const {searchTerm} =  this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  onDismiss(id){
    const { searchKey, results} = this.state;
    const { hits, page } = results[searchKey];

    // function isNotId(item) {
    //   return item.objectID !== id;
    // }

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page }
      }
        });
  }

  onSearchChange(event){
    this.setState({
      searchTerm: event.target.value
    });
    console.log(this.state.searchTerm);
  }

  onSearchSubmit(event){
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }
    event.preventDefault();
  }


  render() {
    const {
      searchTerm,
      results,
      searchKey,
      isLoading,
    } = this.state;

    const page = (
      results &&
      results[searchKey]&&
      results[searchKey].page) || 0;

      const list = (
        results &&
        results[searchKey]&&
        results[searchKey].hits) || [];
    // if (!result) {return null;}
    return (
      <div className="page">
          <div className='interactions'>
              <Search
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
              >
              Search
              </Search>
          </div>
          <Table
            list={list} onDismiss={this.onDismiss}
            />

          <div className='interactions'>
            { isLoading
              ? <Loading />
              :<Button onClick = {()=>this.fetchSearchTopstories(searchKey,page+1)}>More</Button>
            }

          </div>

      </div>
    );
  }
}

const Search = ({
  value,
  onChange,
  onSubmit,
  children}) => {

  return(
    <form onSubmit={onSubmit}>
      {children}
      <input
        type='text'
        value={value}
        onChange={onChange}/>
      <button type="submit">
        {children}
      </button>
    </form>
  );
}

const largeColumn = { width: '40%',};
const midColumn = { width: '30%',};
const smallColumn = { width: '10%',};

class Table extends Component{

  render(){
    const{
      list,
      pattern,
      onDismiss
    }= this.props;

  return(
    <div className='table'>
      { list.map(item=>
        <div key={item.objectID} className='table-row'>
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button
              onClick={()=>onDismiss(item.objectID)}
              className='button-inline'>
              Dismiss
            </Button>
          </span>
        </div>

        )

      }
    </div>
    )
  }
}

class Button extends Component{
  render(){
    const {
      onClick,
      className = '',
      children
    } = this.props;

    return (
      <button
        onClick={onClick}
        className={className}
        type='button'
        >
        {children}
      </button>
    )

  }
}

const Loading = ()=>
<div>Loadding...</div>

export default App;
export {
  Button,
  Search,
  Table
};