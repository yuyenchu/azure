import React , { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Manage from './Manage.jsx';
import Index from './Index.jsx';
// import Hello from './Hello.jsx';
import './page.css';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    render() {
      const App = () => (
        <div>
          <Switch>
            {/* <Route exact path='/' component={Hello}/> */}
            <Route path='/manage/' component={Manage}/>
            <Route path='/home' component={Index}/>
            </Switch>
        </div>
      )
      return (
        <Switch>
          <App/>
        </Switch>
      );
    }
  }
  
  export default App;