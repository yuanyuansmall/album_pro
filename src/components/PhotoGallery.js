import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import './PhotoGallery.css';

export default function PhotoGallery({ album, user }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (album?.id) {
      fetchPhotos();
    }
  }, [album?.id]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', album.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // 获取 auth user id
      const { data: userData, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) {
        console.error('Failed to get auth user:', getUserError);
        alert('无法获取用户信息，请重新登录后再试。');
        setUploading(false);
        return;
      }
      const authUser = userData?.user ?? null;
      const userId = authUser?.id || user?.id;
      if (!userId) {
        alert('请先登录，然后再上传照片。');
        setUploading(false);
        return;
      }

      // 文件名：userId/UUID_filename
      if (!file.type || !file.type.startsWith('image/')) {
        alert('只允许上传图片文件。');
        setUploading(false);
        return;
      }

      const rand = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      const filePath = `${userId}/${rand}_${file.name}`;

      // 1) 上传文件至 Storage，务必设置 contentType，upsert: false
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        setUploading(false);
        alert('上传失败: ' + (uploadError?.message || uploadError));
        return;
      }

      // uploadData.path 包含存储中文件路径
      const storagePath = uploadData?.path || uploadData?.Key || filePath;

      // 1.5) 获取可公开访问的 URL（Supabase 不会自动把 publicUrl 写入 upload response）
      const { data: publicData } = supabase.storage.from('photos').getPublicUrl(storagePath);
      const imageUrl = publicData?.publicUrl || storagePath;

      // 2) 插入到 DB（关键：要传入 user_id）
      const { error: dbError } = await supabase.from('photos').insert({
        user_id: userId,
        album_id: album.id,
        url: imageUrl,
        filename: file.name,
        tags: ''
      });

      if (dbError) {
        console.error('DB insert error:', dbError);
        setUploading(false);
        alert('保存照片记录失败: ' + (dbError?.message || dbError));
        return;
      }

      // 成功后刷新照片列表
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('上传失败: ' + (error?.message || error));
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('确定要删除此照片吗？')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      setSelectedPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <h2>{album?.title}</h2>
        <label className="upload-btn">
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadPhoto}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? '上传中...' : '+ 上传照片'}
        </label>
      </div>

      {loading ? (
        <div className="loading-spinner">加载中...</div>
      ) : photos.length === 0 ? (
        <div className="empty-gallery">
          <p>还没有照片，上传第一张吧！</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="photo-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={supabase.storage.from('photos').getPublicUrl(photo.url).data.publicUrl}
                alt={photo.filename}
                style={{ width: '200px' }}
              />
              <button
                className="photo-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div 
          className="photo-modal"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <img
              src={supabase.storage.from('photos').getPublicUrl(selectedPhoto.url).data.publicUrl}
              alt={selectedPhoto.filename}
            />
            <p>{selectedPhoto.filename}</p>
          </div>
        </div>
      )}
    </div>
  );
}
