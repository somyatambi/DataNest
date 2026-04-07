import React from 'react';

function Navbar({ onLogin, onGetStarted }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">D</div>
          <span className="text-white text-xl font-bold">DataNest</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm text-gray-300">
          <button onClick={() => scrollTo('features')} className="hover:text-white transition">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition">How It Works</button>
          <button onClick={() => scrollTo('contact')} className="hover:text-white transition">About</button>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onLogin} className="text-gray-300 hover:text-white text-sm transition px-4 py-2">Login</button>
          <button onClick={onGetStarted} className="bg-green-500 hover:bg-green-600 text-black font-semibold text-sm px-5 py-2 rounded-lg transition">
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
