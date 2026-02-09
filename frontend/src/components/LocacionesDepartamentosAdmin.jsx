import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LocacionesDepartamentosAdmin() {
  const [locaciones, setLocaciones] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [locacionForm, setLocacionForm] = useState({ nombre: '', direccion: '' });
  const [departamentoForm, setDepartamentoForm] = useState({ nombre: '', locacionId: '' });
  const [editLocacionId, setEditLocacionId] = useState(null);
  const [editDepartamentoId, setEditDepartamentoId] = useState(null);

  useEffect(() => {
    fetchLocaciones();
    fetchDepartamentos();
  }, []);

  const fetchLocaciones = async () => {
    const res = await axios.get(`${API}/locaciones`);
    setLocaciones(res.data);
  };

  const fetchDepartamentos = async () => {
    const res = await axios.get(`${API}/departamentos`);
    setDepartamentos(res.data);
  };

  const handleLocacionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editLocacionId) {
        await axios.put(`${API}/locaciones/${editLocacionId}`, locacionForm);
      } else {
        await axios.post(`${API}/locaciones`, locacionForm);
      }
      setLocacionForm({ nombre: '', direccion: '' });
      setEditLocacionId(null);
      fetchLocaciones();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert('Error: ' + error.response.data.error);
      } else {
        alert('Error inesperado al crear locación');
      }
    }
  };

  const handleDepartamentoSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...departamentoForm,
      locacionid: Number(departamentoForm.locacionId)
    };
    try {
      if (editDepartamentoId) {
        await axios.put(`${API}/departamentos/${editDepartamentoId}`, data);
      } else {
        await axios.post(`${API}/departamentos`, data);
      }
      setDepartamentoForm({ nombre: '', locacionId: '' });
      setEditDepartamentoId(null);
      fetchDepartamentos();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert('Error: ' + error.response.data.error);
      } else {
        alert('Error inesperado al crear departamento');
      }
    }
  };

  const handleEditLocacion = (loc) => {
    setLocacionForm({ nombre: loc.nombre, direccion: loc.direccion });
    setEditLocacionId(loc.id);
  };

  const handleDeleteLocacion = async (id) => {
    await axios.delete(`${API}/locaciones/${id}`);
    fetchLocaciones();
  };

  const handleEditDepartamento = (dep) => {
    setDepartamentoForm({ nombre: dep.nombre, locacionId: dep.locacionId });
    setEditDepartamentoId(dep.id);
  };

  const handleDeleteDepartamento = async (id) => {
    await axios.delete(`${API}/departamentos/${id}`);
    fetchDepartamentos();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Locaciones</h2>
      <form onSubmit={handleLocacionSubmit} className="mb-6 flex gap-2 flex-wrap">
        <input
          className="border p-2 rounded"
          placeholder="Nombre"
          value={locacionForm.nombre}
          onChange={e => setLocacionForm({ ...locacionForm, nombre: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Dirección"
          value={locacionForm.direccion}
          onChange={e => setLocacionForm({ ...locacionForm, direccion: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          {editLocacionId ? 'Actualizar' : 'Agregar'}
        </button>
        {editLocacionId && (
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setEditLocacionId(null); setLocacionForm({ nombre: '', direccion: '' }); }}>Cancelar</button>
        )}
      </form>
      <ul className="mb-8">
        {locaciones.map(loc => (
          <li key={loc.id} className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{loc.nombre}</span> <span className="text-gray-500">{loc.direccion}</span>
            <button className="text-blue-600" onClick={() => handleEditLocacion(loc)}>Editar</button>
            <button className="text-red-600" onClick={() => handleDeleteLocacion(loc.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold mb-4">Gestión de Departamentos</h2>
      <form onSubmit={handleDepartamentoSubmit} className="mb-6 flex gap-2 flex-wrap">
        <input
          className="border p-2 rounded"
          placeholder="Nombre"
          value={departamentoForm.nombre}
          onChange={e => setDepartamentoForm({ ...departamentoForm, nombre: e.target.value })}
          required
        />
        <select
          className="border p-2 rounded"
          value={departamentoForm.locacionId}
          onChange={e => setDepartamentoForm({ ...departamentoForm, locacionId: e.target.value })}
          required
        >
          <option value="">Selecciona locación</option>
          {locaciones.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nombre}</option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          {editDepartamentoId ? 'Actualizar' : 'Agregar'}
        </button>
        {editDepartamentoId && (
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setEditDepartamentoId(null); setDepartamentoForm({ nombre: '', locacionId: '' }); }}>Cancelar</button>
        )}
      </form>
      <ul>
        {departamentos.map(dep => (
          <li key={dep.id} className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{dep.nombre}</span> <span className="text-gray-500">{dep.Locacion ? `(${dep.Locacion.nombre})` : '(Sin locación)'}</span>
            <button className="text-blue-600" onClick={() => handleEditDepartamento(dep)}>Editar</button>
            <button className="text-red-600" onClick={() => handleDeleteDepartamento(dep.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
