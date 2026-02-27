import React from 'react';

const TablaGeneral = ({ disciplinas, filas }) => {
  return (
    <div className="overflow-x-auto bg-slate-800 rounded-lg shadow-xl p-4">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs uppercase bg-slate-700 text-deporte-gold">
          <tr>
            <th className="px-4 py-3">Promoción</th>
            <th className="px-4 py-3">Categoría</th>
            {disciplinas.map((disciplina) => (
              <th key={disciplina.id} className="px-4 py-3 text-center">
                {disciplina.nombre}
              </th>
            ))}
            <th className="px-4 py-3 text-center font-bold bg-slate-600">Total</th>
            <th className="px-4 py-3 text-center font-bold bg-slate-600">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
              <td className="px-4 py-3 font-medium text-white">{fila.promocion}</td>
              <td className="px-4 py-3">{fila.categoria}</td>
              {disciplinas.map((disciplina) => (
                <td key={disciplina.id} className="px-4 py-3 text-center">
                  {fila.puntajes[disciplina.id]?.puntos ?? 0}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold text-yellow-400">{fila.total}</td>
              <td className="px-4 py-3 text-center font-bold text-white">{fila.promedio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaGeneral;