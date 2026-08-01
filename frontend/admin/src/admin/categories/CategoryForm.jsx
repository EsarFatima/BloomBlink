import { useState, useEffect } from 'react';
import { uploadImage } from '../api';

const emptyForm = { name: '', description: '', imageUrl: '', slug: '' };

export default function CategoryForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initialData || emptyForm);
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = form.imageUrl;

    if (selectedFile) {
      setUploading(true);
      imageUrl = await uploadImage(selectedFile);
      setUploading(false);
    }

    onSubmit({ ...form, imageUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label>
        Slug
        <input name="slug" value={form.slug} onChange={handleChange} required />
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>
      <label>
        Image URL
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
      </label>
      <label>
        Upload Image
        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
      </label>
      <div className="form-actions">
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : initialData ? 'Update' : 'Create'}</button>
        {initialData && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

