import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PostAdPage from './pages/PostAdPage';
import EditAdPage from './pages/EditAdPage';
import MyAdsPage from './pages/MyAdsPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import SellerProfilePage from './pages/SellerProfilePage';
import SellerStorefrontPage from './pages/SellerStorefrontPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReferralPage from './pages/ReferralPage';
import CityPage from './pages/CityPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Handles /r/:code — saves code to localStorage then redirects to login
function ReferralRedirect() {
  const { code } = useParams();
  if (code) localStorage.setItem('salepe_ref_code', code);
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/r/:code" element={<ReferralRedirect />} />
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/listings" element={<Layout><ListingsPage /></Layout>} />
              <Route path="/listings/:id" element={<Layout><ListingDetailPage /></Layout>} />
              <Route path="/post-ad" element={<Layout><PostAdPage /></Layout>} />
              <Route path="/edit-ad/:id" element={<Layout><EditAdPage /></Layout>} />
              <Route path="/my-ads" element={<Layout><MyAdsPage /></Layout>} />
              <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
              <Route path="/saved" element={<Layout><WishlistPage /></Layout>} />
              <Route path="/seller/:userId" element={<Layout><SellerProfilePage /></Layout>} />
              <Route path="/messages" element={<Layout><MessagesPage /></Layout>} />
              <Route path="/messages/:conversationId" element={<Layout><ChatPage /></Layout>} />
              <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
              <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
              <Route path="/referral" element={<Layout><ReferralPage /></Layout>} />
              <Route path="/in/:city" element={<Layout><CityPage /></Layout>} />
              <Route path="/in/:city/:category" element={<Layout><CityPage /></Layout>} />
              <Route path="/store/:userId" element={<Layout><SellerStorefrontPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            </Routes>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
