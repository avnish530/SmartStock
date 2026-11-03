import { useEffect, useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/orders'),
      api.get('/products'),
      api.get('/customers')
    ])
      .then(([o, p, c]) => {
        setOrders(o.data);
        setProducts(p.data);
        setCustomers(c.data);
      })
      .catch(e => setError(e.response?.data?.message || e.message));
  }, []);

  const exportFile = (name, data, type) => {
    const blob = new Blob(
      [type === 'json' ? JSON.stringify(data, null, 2) : toCsv(data)],
      { type: type === 'json' ? 'application/json' : 'text/csv' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartstock-${name}.${type === 'json' ? 'json' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = file.name.endsWith('.json')
        ? JSON.parse(text)
        : parseCsv(text);

      const key = file.name.toLowerCase().includes('customer')
        ? 'customers'
        : 'products';

      await api.post(`/${key}/bulk/import`, { rows });
      alert(`${key} imported.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }

    e.target.value = '';
  };

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h2>Reports & data</h2>
          <p className="muted">Review your current records and export backups.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="report-grid">
        <div className="report-card">
          <span>Gross sales (non-cancelled)</span>
          <b>{money(orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.totalAmount, 0))}</b>
          <small>{orders.length} recorded orders</small>
        </div>

        <div className="report-card">
          <span>Inventory value at cost of listed price</span>
          <b>{money(products.reduce((s, p) => s + p.price * p.stock, 0))}</b>
          <small>{products.length} products · {products.reduce((s, p) => s + p.stock, 0)} units</small>
        </div>

        <div className="report-card">
          <span>Customers</span>
          <b>{customers.length}</b>
          <small>Customer records</small>
        </div>
      </div>

      <section className="table-card data-tools">
        <h3>Export data</h3>
        <p className="muted">Download a local backup of each collection.</p>

        <div className="toolbar-actions">
          {[
            ['products', products],
            ['customers', customers],
            ['orders', orders]
          ].map(([name, data]) => (
            <div className="export-group" key={name}>
              <b>{name}</b>
              <button className="secondary-btn" onClick={() => exportFile(name, data, 'csv')}>
                <FileSpreadsheet size={16} /> CSV
              </button>
              <button className="secondary-btn" onClick={() => exportFile(name, data, 'json')}>
                <FileJson size={16} /> JSON
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="table-card data-tools">
        <h3>Import products or customers</h3>
        <p className="muted">
          Choose a JSON or CSV file. Product files need name, sku, category, price and stock.
          Customer files need name, email and phone.
        </p>

        <label className="secondary-btn file-label">
          <Download size={16} /> Select CSV / JSON file
          <input type="file" accept=".csv,.json" onChange={importFile} hidden />
        </label>

        <small className="muted">
          File name containing “customer” imports customers; other names import products.
          Import adds records and does not replace existing records.
        </small>
      </section>
    </div>
  );
}

function money(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);
}

function toCsv(rows) {
  if (!rows.length) return '';

  const cols = Object.keys(rows[0]).filter(k => !['_id', '__v'].includes(k));

  return [
    cols.join(','),
    ...rows.map(r =>
      cols.map(k =>
        `"${String(typeof r[k] === 'object'
          ? JSON.stringify(r[k] ?? '')
          : r[k] ?? '').replaceAll('"', '""')}"`
      ).join(',')
    )
  ].join('\n');
}

function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/);
  const keys = head.split(',').map(s => s.trim());

  return lines.map(line => {
    const vals = line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
      ?.filter(Boolean)
      .map(s => s.replace(/,$/, '').replace(/^"|"$/g, '').replaceAll('""', '"')) || [];

    return Object.fromEntries(keys.map((k, i) => [k, vals[i] || '']));
  });
}