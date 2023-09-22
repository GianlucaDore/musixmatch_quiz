import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Quiz } from './pages/Quiz';
import { Home } from './pages/Home';
import { Leaderboards } from './pages/Leaderboards';
import { NotFound } from './pages/NotFound';

function App() 
{

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={ <Home /> } />
          <Route path='/quiz' element={ <Quiz /> } />
          <Route path='/leaderboards' element={ <Leaderboards /> } />
          <Route path="*" element={ <NotFound /> } />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
