import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PostAdPage from './pages/PostAdPage';
import EditAdPage from './pages/EditAdPage';
import MyAdsPage from './pages/MyAdsPage';
import ProfilePage from './pages/ProfilePage';

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/listings" element={<Layout><ListingsPage /></Layout>} />
          <Route path="/listings/:id" element={<Layout><ListingDetailPage /></Layout>} />
          <Route path="/post-ad" element={<Layout><PostAdPage /></Layout>} />
          <Route path="/edit-ad/:id" element={<Layout><EditAdPage /></Layout>} />
          <Route path="/my-ads" element={<Layout><MyAdsPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
