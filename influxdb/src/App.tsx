import "./App.css";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  limit,
  query,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCP8oWKwX6YiA9LXPnWmnnObOlNhz4OmB8",
  authDomain: "wifilogger-api.firebaseapp.com",
  databaseURL: "https://wifilogger-api.firebaseio.com",
  projectId: "wifilogger-api",
  storageBucket: "wifilogger-api.appspot.com",
  messagingSenderId: "442272046235",
  appId: "1:442272046235:web:2052d15bbb9dfd2be4ba3e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

function App() {
  const observations = collection(db, "observations");

  const data = getDocs(query(observations, limit(10))).then((snap) =>
    snap.forEach((doc) => {
      console.log(doc.data());
    })
  );

  return <h1>InfluxDB</h1>;
}

export default App;
