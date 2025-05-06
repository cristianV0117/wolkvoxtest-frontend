'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.data || data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId === null) {
      // Crear producto
      const res = await fetch('http://localhost/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const created = await res.json();
      const newProduct: Product = created.data || created;
      setProducts([...products, newProduct]);
    } else {
      // Actualizar producto
      const res = await fetch(`http://localhost/api/products/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const updated = await res.json();
      const updatedProduct: Product = updated.data || updated;
      setProducts(
        products.map((p) => (p.id === editingId ? updatedProduct : p))
      );
      setEditingId(null);
    }

    setForm({ name: '', price: '' });
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirm) return;

    await fetch(`http://localhost/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (product: Product) => {
    setForm({ name: product.name, price: product.price.toString() });
    setEditingId(product.id);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">
        {editingId ? 'Editar producto' : 'Agregar producto'}
      </h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <input
            required
            type="text"
            className="form-control"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <input
            required
            type="number"
            className="form-control"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <button className="btn btn-primary">
          {editingId ? 'Actualizar producto' : 'Agregar producto'}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => {
              setForm({ name: '', price: '' });
              setEditingId(null);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul className="list-group">
        {products.map((p) => (
          <li
            key={p.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{p.name}</strong> - ${p.price}
            </div>
            <div>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => handleEdit(p)}
              >
                Editar
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(p.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}