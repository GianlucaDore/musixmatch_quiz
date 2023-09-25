import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Quiz } from './pages/Quiz';
import { Home } from './pages/Home';
import { Leaderboards } from './pages/Leaderboards';
import { NotFound } from './pages/NotFound';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

const persistor = persistStore(store);

function App() 
{

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route exact path='/' element={ <Home /> } />
            <Route path='/quiz' element={ <Quiz /> } />
            <Route path='/leaderboards' element={ <Leaderboards /> } />
            <Route path="*" element={ <NotFound /> } />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
