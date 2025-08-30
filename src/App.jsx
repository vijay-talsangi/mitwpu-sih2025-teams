import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ProblemStatements from './ProblemStatements';
import Teams from './team';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Teams />} />
        <Route path="/ps" element={<ProblemStatements />} />
      </Routes>
    </Router>
  );
}

export default App;