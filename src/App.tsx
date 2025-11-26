import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TextSearch from './components/TextSearch';
import ImageSearch from './components/ImageSearch';
import UploadComponent from './components/Upload';
import Admin from './components/Admin';
import './index.css';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TextSearch />} />
          <Route path="/text-search" element={<TextSearch />} />
          <Route path="/image-search" element={<ImageSearch />} />
          <Route path="/upload" element={<UploadComponent />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}