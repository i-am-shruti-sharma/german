import React from "react";
import AddWord from "./AddWord";
import WordList from "./WordList";
import './App.css';
const App = () => {
  return (
    <div>
      <h1>German Vocabulary Tracker</h1>
      <AddWord />
      <WordList />
    </div>
  );
};

export default App;
