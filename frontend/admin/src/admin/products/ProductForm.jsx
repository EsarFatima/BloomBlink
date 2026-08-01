import { useState, useEffect } from 'react';
import { uploadImage } from '../api';

const emptyForm = {
  name: '',
  description: '',
  categoryId: '',
  imageUrl: '',
  featured: false,
  status: 'active',
};

export default function ProductForm({ initialData, categories, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initialData || emptyForm);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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
    <form onSubmit={handleSubmit} className="product-form">
      <label>
        Name
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Blush garden bouquet"
          required
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the flowers, finish, and ideal occasion."
          rows="4"
        />
      </label>
      <label>
        Category
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Image URL
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/product.jpg"
          type="url"
        />
      </label>
      <label>
        Upload Image
        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
      </label>
      <label>
        Status
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label className="checkbox-label">
        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
        Featured
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
          {initialData ? 'Update product' : 'Create product'}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
>>>>>>> 7022a0b86d72da4d59160aa61e29909197778de2
      </div>
    </form>
  );
}
