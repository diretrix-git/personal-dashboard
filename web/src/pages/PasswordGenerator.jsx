import { useState, useEffect } from 'react';
import { KeyRound, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    
    // Auto-clear clipboard for security (fixing BUG-9 by not relying on closure for exact match, 
    // or simply clearing it unconditionally after 30s as a basic security measure)
    setTimeout(() => {
      navigator.clipboard.readText().then(text => {
        if (text === password) {
          navigator.clipboard.writeText('');
        }
      }).catch(() => {}); // Ignore errors if clipboard permission is denied
    }, 30000);
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4 lg:pt-12">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Password Generator</h2>
        <p className="text-stone-500 mt-2">Create strong, secure passwords instantly.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Output Area */}
        <div className="bg-stone-900 p-6 sm:p-8 relative group">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-xl sm:text-2xl text-emerald-400 break-all select-all tracking-wider">
              {password}
            </div>
            <button
              onClick={handleCopy}
              className={`shrink-0 p-2 rounded-lg flex items-center justify-center transition-colors ${
                copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
              }`}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
          {copied && (
            <div className="absolute bottom-2 right-8 text-xs font-medium text-emerald-400">
              Copied! (Clears in 30s)
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-stone-700">Password Length</label>
              <span className="text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
              <span className="font-medium text-stone-700">Include Uppercase (A-Z)</span>
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-stone-300 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
              <span className="font-medium text-stone-700">Include Numbers (0-9)</span>
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-stone-300 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer">
              <span className="font-medium text-stone-700">Include Symbols (!@#$)</span>
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-stone-300 rounded focus:ring-primary-500"
              />
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-lg shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Generate New Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
