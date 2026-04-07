import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import { excelAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

function Dashboard({ user, onLogout }) {
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({ removeDuplicates: true, fillMissing: true, trimSpaces: true });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [dragging, setDragging] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await excelAPI.getHistory();
      if (res.success) setHistory(res.history);
    } catch {}
  };

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) { setError('Please select an Excel file (.xlsx or .xls)'); return; }
    setFile(f); setResult(null); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClean = async () => {
    if (!file) { setError('Please select a file first'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await excelAPI.cleanFile(file, options);
      if (res.success) { setResult(res); setActiveTab('results'); loadHistory(); }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process file. Please try again.');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!result?.cleanedFilename) return;
    try { await excelAPI.downloadFile(result.cleanedFilename); }
    catch { alert('Download failed. Please try again.'); }
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      x: { ticks: { color: '#9ca3af', maxRotation: 45 }, grid: { display: false } }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black">D</div>
          <span className="text-xl font-bold text-green-400">DataNest</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Hello, <span className="text-white">{user.name}</span></span>
          <button onClick={onLogout} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition">Logout</button>
        </div>
      </header>

      <div className="p-6">
        <div className="flex space-x-2 mb-6 flex-wrap gap-2 border-b border-gray-800 pb-4">
          {['upload', 'results', 'history', 'insights', 'predictions'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {tab === 'results' && result ? '✓ Results' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* UPLOAD */}
        {activeTab === 'upload' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragging ? 'border-green-400 bg-green-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
            >
              <div className="text-5xl mb-3">�</div>
              <p className="text-gray-200 text-lg mb-1">Drop your Excel file here</p>
              <p className="text-gray-500 text-sm mb-4">Supports .xlsx and .xls files</p>
              <label className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition">
                Choose File
                <input type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} className="hidden" />
              </label>
              {file && <p className="mt-4 text-green-400 text-sm">✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Cleaning Options</h3>
              <div className="space-y-3">
                {[
                  { key: 'removeDuplicates', label: 'Remove Duplicate Rows', desc: 'Find and delete all identical rows' },
                  { key: 'fillMissing', label: 'Fill Missing Values', desc: 'Replace empty cells with "N/A"' },
                  { key: 'trimSpaces', label: 'Trim Extra Spaces', desc: 'Remove leading/trailing spaces from text' }
                ].map(opt => (
                  <label key={opt.key} className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" checked={options[opt.key]} onChange={e => setOptions({ ...options, [opt.key]: e.target.checked })} className="mt-0.5" />
                    <div>
                      <div className="text-gray-200 text-sm font-medium">{opt.label}</div>
                      <div className="text-gray-500 text-xs">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">{error}</div>}

            <button onClick={handleClean} disabled={!file || loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-4 rounded-xl text-lg transition">
              {loading ? 'Processing...' : 'Clean My Excel File'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === 'results' && result && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Original Rows', value: result.stats.originalRows, color: 'text-gray-300' },
                { label: 'Cleaned Rows', value: result.stats.cleanedRows, color: 'text-green-400' },
                { label: 'Dupes Removed', value: result.stats.duplicatesRemoved, color: 'text-red-400' },
                { label: 'Missing Filled', value: result.stats.missingFilled, color: 'text-yellow-400' },
                { label: 'Columns', value: result.stats.columns, color: 'text-blue-400' }
              ].map(c => (
                <div key={c.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                  <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl transition">
                Download Cleaned File
              </button>
              <button onClick={() => setActiveTab('upload')}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl transition">
                Upload Another
              </button>
            </div>

            {result.chartData && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="text-white font-semibold mb-4">Data Visualization</h3>
                <Bar data={{ labels: result.chartData.labels, datasets: result.chartData.datasets }} options={chartOptions} />
              </div>
            )}

            {result.preview && result.preview.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="text-white font-semibold mb-4">Data Preview <span className="text-gray-500 text-sm font-normal">(first 50 rows)</span></h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-800 text-gray-400">
                        {result.columns.map(col => <th key={col} className="text-left px-3 py-2 whitespace-nowrap">{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-800/40'}>
                          {result.columns.map(col => (
                            <td key={col} className="px-3 py-2 text-gray-300 whitespace-nowrap max-w-xs truncate">
                              {row[col] != null ? String(row[col]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && !result && (
          <div className="text-center py-20 text-gray-500">
            No results yet. Go to the Upload tab to process a file.
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Your File History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No files processed yet. Upload your first Excel file!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left pb-2">File Name</th>
                    <th className="text-left pb-2">Original</th>
                    <th className="text-left pb-2">Cleaned</th>
                    <th className="text-left pb-2">Dupes</th>
                    <th className="text-left pb-2">Missing</th>
                    <th className="text-left pb-2">Date</th>
                  </tr></thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id} className="border-b border-gray-800/50 text-gray-300">
                        <td className="py-2">{h.filename}</td>
                        <td className="py-2">{h.original_rows}</td>
                        <td className="py-2 text-green-400">{h.cleaned_rows}</td>
                        <td className="py-2 text-red-400">{h.duplicates_removed}</td>
                        <td className="py-2 text-yellow-400">{h.missing_filled}</td>
                        <td className="py-2 text-gray-500">{new Date(h.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-white text-2xl font-bold mb-4">Actionable Insights</h3>
              
              {!result ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4">Please upload and clean a dataset first to generate insights.</p>
                  <button onClick={() => setActiveTab('upload')} className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-sm text-black font-bold transition">Go to Upload</button>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 max-w-3xl mx-auto">
                  <h4 className="text-blue-400 font-semibold mb-4 text-lg">Data Quality & Financial Development Operations</h4>
                  <ul className="space-y-5 text-gray-300 relative">
                    <li className="flex items-start bg-gray-900 p-4 rounded-lg border border-gray-800">
                      <div>
                        <strong>Financial Data Completeness:</strong> <strong>{result.stats.missingFilled}</strong> missing values found. Identifying and enforcing data fields during entry could recover up to 15% in misattributed cost items.
                      </div>
                    </li>
                    <li className="flex items-start bg-gray-900 p-4 rounded-lg border border-gray-800">
                      <div>
                        <strong>Bookkeeping Integrity:</strong> <strong>{result.stats.duplicatesRemoved}</strong> duplicate ledger lines removed. By restricting multiple entries, operational inefficiency can be drastically reduced.
                      </div>
                    </li>
                    <li className="flex items-start bg-gray-900 p-4 rounded-lg border border-gray-800">
                      <div>
                        <strong>Developmentally Optimized:</strong> <strong>{result.stats.cleanedRows}</strong> highly structured financial rows are now ready for strategic corporate use.
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PREDICTIONS */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h3 className="text-white text-2xl font-bold mb-4">Growth Predictions</h3>
              
              {!result ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4">Please upload and clean a dataset first to generate predictions.</p>
                  <button onClick={() => setActiveTab('upload')} className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-sm text-black font-bold transition">Go to Upload</button>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                   <h4 className="text-green-400 font-semibold mb-3 text-lg">Strategic Financial Forecasting</h4>
                   <p className="text-gray-300 text-base mb-6">Based on the historic dataset (<strong>{result.stats.originalRows} data points</strong>), our linear regression forecasting model estimates a trend change of <strong className={result.chartData?.expectedGrowth > 0 ? "text-green-400" : "text-red-400"}>{result.chartData?.expectedGrowth}% growth</strong> projected over equivalent time metrics. A steady development points toward improving company stability.</p>
                   
                   {result.chartData ? (
                     <div className="mt-4 bg-gray-900 p-6 rounded-xl border border-gray-800 max-w-4xl mx-auto">
                       <Line data={{ labels: result.chartData.labels, datasets: result.chartData.trendDatasets }} options={{
                         ...chartOptions,
                         plugins: {
                           ...chartOptions.plugins,
                           title: { display: true, text: 'Linear Trend Financial Projection', color: '#9ca3af', font: { size: 16 } }
                         }
                       }} />
                     </div>
                   ) : (
                     <div className="text-gray-500 text-center py-10 border border-dashed border-gray-700 rounded-lg">
                        Not enough numeric data points in the file to generate an accurate projection chart.
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
