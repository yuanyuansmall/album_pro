import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import './AlbumList.css';

export default function AlbumList({ user, selectedAlbum, onSelectAlbum }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlbums();
    }
  }, [user]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('albums')
        .select('id, title, cover_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      const payload = [{ title: newAlbumName, user_id: user.id, cover_url: null }];

      // 请求返回表示（便于调试），并打印更详细的错误信息以定位 409
      const { data: inserted, error } = await supabase
        .from('albums')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Create album error (raw):', error);
        try {
          console.error('Create album error (stringified):', JSON.stringify(error, null, 2));
        } catch (e) {
          // ignore
        }
        throw error;
      }

      console.log('Album created:', inserted?.id || inserted);
      setNewAlbumName('');
      setShowForm(false);
      fetchAlbums();
    } catch (error) {
      console.error('Error creating album:', error);
      // 如果是 HTTP 层冲突，尝试显示更多可能有用的信息
      if (error?.details) console.error('Details:', error.details);
      if (error?.hint) console.error('Hint:', error.hint);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('确定要删除此相册吗？')) return;

    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;
      if (selectedAlbum?.id === albumId) {
        onSelectAlbum(null);
      }
      fetchAlbums();
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  return (
    <div className="album-list">
      <h2>我的相册</h2>
      
      {!showForm && (
        <button 
          className="create-btn"
          onClick={() => setShowForm(true)}
        >
          + 新建相册
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreateAlbum} className="create-form">
          <input
            type="text"
            placeholder="相册名称"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button type="submit">创建</button>
            <button 
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewAlbumName('');
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="albums-container">
        {loading ? (
          <p className="loading">加载中...</p>
        ) : albums.length === 0 ? (
          <p className="empty">暂无相册</p>
        ) : (
          albums.map((album) => (
            <div
              key={album.id}
              className={`album-item ${selectedAlbum?.id === album.id ? 'active' : ''}`}
              onClick={() => onSelectAlbum(album)}
            >
              <div className="album-cover">
                {album.cover_url ? (
                  <img src={album.cover_url} alt={album.title} />
                ) : (
                  <div className="no-cover">📷</div>
                )}
              </div>
              <div className="album-info">
                <h3>{album.title}</h3>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
