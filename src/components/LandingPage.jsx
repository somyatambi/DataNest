import React from 'react';

const FEATURES = [
  { icon: '📊', title: 'Excel File Cleaning', desc: 'Automatically remove duplicates, fix missing values, and standardize your data in seconds.' },
  { icon: '📈', title: 'Smart Analytics', desc: 'Get instant insights from your business data with visual charts and summaries.' },
  { icon: '🔮', title: 'Growth Predictions', desc: 'See accurate forecasts for 3, 6, and 12 months based on your data trends.' },
  { icon: '💡', title: 'Actionable Insights', desc: 'Understand trends and make data-driven decisions effortlessly.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your data is protected with secure authentication and encrypted storage.' },
  { icon: '⚡', title: 'Fast Processing', desc: 'Upload and get results in seconds. No technical knowledge required.' }
];

const STEPS = [
  { num: '01', title: 'Upload Your File', desc: 'Drag & drop your Excel file (.xlsx or .xls). No technical skills needed.' },
  { num: '02', title: 'Clean & Analyze', desc: 'Our system automatically removes errors, duplicates, and formats your data.' },
  { num: '03', title: 'View Insights', desc: 'Get interactive charts, statistics, and a downloadable cleaned file.' }
];

function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-green-400/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Smart Excel Report<br />
            <span className="text-green-400">&amp; Dashboard</span><br />
            System
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Upload your Excel file and let the system automatically clean the data,
            generate reports, and display interactive dashboards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onGetStarted} className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl text-lg transition">
              Create Account
            </button>
            <button onClick={onLogin} className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg transition">
              Login
            </button>
          </div>
          <div className="flex justify-center gap-12 mt-14 text-center">
            <div><div className="text-4xl font-bold text-green-400">MERN</div><div className="text-gray-500 text-sm mt-1">Stack</div></div>
            <div><div className="text-4xl font-bold text-green-400">SQLite</div><div className="text-gray-500 text-sm mt-1">Database</div></div>
            <div><div className="text-4xl font-bold text-green-400">React</div><div className="text-gray-500 text-sm mt-1">Frontend</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Project Features</h2>
          <p className="text-gray-400 text-center mb-14">Core modules developed as part of the Smart Excel Report and Dashboard System</p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 mb-14">Three simple steps to transform your data</p>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="relative">
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold text-lg mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6 bg-green-500/5 border-t border-green-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">About This Project</h2>
          <p className="text-gray-400 mb-4">This innovative platform provides cutting-edge tools for fast data operations.</p>
          <p className="text-gray-500 mb-8 text-sm">The system solves the problem of manual Excel data cleaning and reporting by automating the entire process — from file upload to interactive dashboards and downloadable cleaned reports.</p>
          <button onClick={onGetStarted} className="bg-green-500 hover:bg-green-600 text-black font-bold px-10 py-4 rounded-xl text-lg transition">
            Create Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-10 px-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-black font-bold text-xs">D</div>
          <span className="text-white font-semibold">DataNest</span>
        </div>
        <p>Smart Excel Report and Dashboard System</p>
        <p className="mt-1">© 2026 DataNest</p>
      </footer>
    </div>
  );
}

export default LandingPage;
