import React from 'react';

const DataTable = ({ columns, data }) => {
  return (
    <table className="w-full bg-white border-2 border-beige rounded-xl overflow-hidden">
      <thead>
        <tr className="bg-pink-principal text-white">
          {columns.map((col, index) => (
            <th key={index} className="p-2 text-left">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-t border-beige hover:bg-beige">
            {columns.map((col, colIndex) => (
              <td key={colIndex} className="p-2">
                {col.render ? col.render(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;