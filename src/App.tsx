import "./App.css";
import Wow from "./Wow";
import Firestore from "./Firestore";
import InfluxDb from "./InfluxDb";

function App() {
  return (
    <div>
      <h1>InfluxDB</h1>
      <div className="flex">
        <div>
          <Firestore />
          <Wow />
        </div>
        <div>
          <InfluxDb />
        </div>
      </div>
    </div>
  );
}

export default App;
