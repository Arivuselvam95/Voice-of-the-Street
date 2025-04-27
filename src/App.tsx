import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ReportComplaint from './pages/ReportComplaint';
import { ComplaintProvider } from './context/ComplaintContext';

function App() {
  return (
    <ComplaintProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportComplaint />} />
          </Routes>
        </Layout>
      </Router>
    </ComplaintProvider>
  );
}

export default App;