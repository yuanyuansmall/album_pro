import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient.js';
import AlbumList from './components/AlbumList.js';
import PhotoGallery from './components/PhotoGallery.js';
import Auth from './components/Auth.js';

function App() {
  const [user, setUser] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedAlbum(null);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📷 相册管理系统</h1>
        <button onClick={handleLogout} className="logout-btn">退出登录</button>
      </header>
      
      <main className="app-main">
        <div className="sidebar">
          <AlbumList 
            user={user} 
            selectedAlbum={selectedAlbum}
            onSelectAlbum={setSelectedAlbum}
          />
        </div>
        
        <div className="content">
          {selectedAlbum ? (
            <PhotoGallery 
              album={selectedAlbum} 
              user={user}
            />
          ) : (
            <div className="no-album">
              <p>请选择一个相册来查看或添加照片</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
