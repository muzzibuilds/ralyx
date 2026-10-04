/**
 * Admin Table Component
 * Reusable table for displaying data
 */

import React from 'react';
import './AdminTable.css';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminTableProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRowClick,
  actions,
  emptyMessage = 'No data found',
}: AdminTableProps<T>) {
  if (isLoading) {
    return <div className="admin-table admin-table--loading">Loading...</div>;
  }

  if (error) {
    return <div className="admin-table admin-table--error">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="admin-table admin-table--empty">{emptyMessage}</div>;
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead className="admin-table__header">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="admin-table__header-cell"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
            {actions && <th className="admin-table__header-cell">Actions</th>}
          </tr>
        </thead>
        <tbody className="admin-table__body">
          {data.map((row, index) => (
            <tr
              key={row.id}
              className="admin-table__row"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="admin-table__cell"
                  style={{ width: column.width }}
                >
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : String(row[column.key])}
                </td>
              ))}
              {actions && (
                <td className="admin-table__cell admin-table__cell--actions">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
