import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaquetesAdmin() {
  const [paquetes, setPaquetes] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    imagen: '',
    grupo: '',
    calificacion: '',
    tipo: 'Internacional',
    activo: true
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const fetchPaquetes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/paquetes`);
      setPaquetes(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar paquetes: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nombre.trim()) {
      setError('El nombre del paquete es obligatorio');
      return;
    }
    if (!form.precio || isNaN(form.precio)) {
      setError('El precio es obligatorio y debe ser un número');
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API}/paquetes/${editId}`, form);
        setSuccess('✅ Paquete actualizado correctamente');
      } else {
        await axios.post(`${API}/paquetes`, form);
        setSuccess('✅ Paquete creado correctamente');
      }
      resetForm();
      setShowForm(false);
      fetchPaquetes();
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (paq) => {
    setForm({
      nombre: paq.nombre,
      descripcion: paq.descripcion || '',
      precio: paq.precio,
      duracion: paq.duracion || '',
      imagen: paq.imagen || '',
      grupo: paq.grupo || '',
      calificacion: paq.calificacion || '',
      tipo: paq.tipo || 'Internacional',
      activo: paq.activo !== false
    });
    setEditId(paq.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      try {
        await axios.delete(`${API}/paquetes/${id}`);
        setSuccess('✅ Paquete eliminado correctamente');
        fetchPaquetes();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const resetForm = () => {
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      imagen: '',
      grupo: '',
      calificacion: '',
      tipo: 'Internacional',
      activo: true
    });
    setEditId(null);
    setError('');
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Paquetes Turísticos</h2>
        <p className="text-gray-600">Administra los paquetes turísticos disponibles para tus clientes</p>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700">✕</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-700">✕</button>
        </div>
      )}

      {/* Botón para agregar nuevo paquete */}
      <div className="mb-6">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Nuevo Paquete
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {editId ? 'Editar Paquete' : 'Nuevo Paquete'}
            </h3>
            <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Nombre del paquete"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <input
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Precio (USD)"
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
            <input
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Duración (ej: 7 días / 6 noches)"
              value={form.duracion}
              onChange={(e) => setForm({ ...form, duracion: e.target.value })}
            />
            <input
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Grupo recomendado (ej: 2-8 personas)"
              value={form.grupo}
              onChange={(e) => setForm({ ...form, grupo: e.target.value })}
            />
            <input
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Calificación (0-5)"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.calificacion}
              onChange={(e) => setForm({ ...form, calificacion: e.target.value })}
            />
            <select
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
            <textarea
              className="col-span-1 md:col-span-2 border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Descripción detallada"
              rows="3"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <input
              className="col-span-1 md:col-span-2 border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="URL de imagen"
              value={form.imagen}
              onChange={(e) => setForm({ ...form, imagen: e.target.value })}
            />
            <label className="col-span-1 md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Activo</span>
            </label>

            <div className="col-span-1 md:col-span-2 flex gap-2">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                type="submit"
              >
                {editId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
                type="button"
                onClick={handleCloseForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de paquetes */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando paquetes...</div>
      ) : paquetes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay paquetes creados aún</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paquetes.map((paq) => (
            <div
              key={paq.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{paq.nombre}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{paq.descripcion}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">${paq.precio}</p>
                  <p>{paq.duracion || 'N/A'}</p>
                  <p className="text-xs">{paq.grupo || 'N/A'}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>⭐ {paq.calificacion || 'N/A'}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${
                    paq.tipo === 'Nacional' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {paq.tipo}
                  </span>
                  <p className={`mt-2 px-2 py-1 rounded text-xs font-semibold inline-block ${
                    paq.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {paq.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(paq)}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition text-sm"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(paq.id)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition text-sm"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
