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
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Signature bouquets"
          required
        />
      </label>
      <label>
        Slug
        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="signature-bouquets"
          required
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="A short description shown with this collection."
          rows="4"
        />
      </label>
      <label>
        Image URL
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/collection.jpg"
          type="url"
        />
      </label>
      <label>
        Upload Image
        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
      </label>
      <div className="form-actions">
<<<<<<< HEAD
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : initialData ? 'Update' : 'Create'}</button>
        {initialData && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
=======
        <button className="btn-primary" type="submit">
          {initialData ? 'Update category' : 'Create category'}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
>>>>>>> 7022a0b86d72da4d59160aa61e29909197778de2
      </div>
    </form>
  );
}
