import './App.css';
import Tracker from './Tracker';

function App() {
  return (
    <div className="App">
      <h1>
        Cowin auto scheduling app
      </h1>
      <hr/>
      <table width="100%" align="center">        
        <tr>
          <td><Tracker/></td>
        </tr>
      </table>
      <hr/>
    </div>
  );
}

export default App;
