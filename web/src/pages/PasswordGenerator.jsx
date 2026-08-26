import { useState, useCallback, useRef } from 'react';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }

    setPassword(generatedPassword);
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-clear clipboard after 30 seconds
      timeoutRef.current = setTimeout(async () => {
        try {
          // Verify we're clearing the password we just copied
          // (some browsers might restrict this if focus is lost, but it's a best-effort client-side feature)
          const currentClipboard = await navigator.clipboard.readText();
          if (currentClipboard === password) {
             await navigator.clipboard.writeText('');
             console.log('Clipboard auto-cleared for security.');
          }
        } catch (err) {
          console.error('Failed to auto-clear clipboard', err);
        }
        setCopied(false);
      }, 30000);
    } catch (err) {
      console.error('Failed to copy password', err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Password Generator</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        Generates passwords locally in your browser. No data is sent to the server.
        The clipboard will auto-clear 30 seconds after copying.
      </p>

      <div style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '2rem',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        wordBreak: 'break-all',
        minHeight: '60px'
      }}>
        <strong style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
          {password || 'Click Generate'}
        </strong>
        <button 
          onClick={copyToClipboard} 
          disabled={!password}
          style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Length: {length}</span>
          <input 
            type="range" 
            min="8" 
            max="64" 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))} 
            style={{ width: '60%' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <label>
          <input type="checkbox" checked={includeUppercase} onChange={e => setIncludeUppercase(e.target.checked)} /> Include Uppercase Letters
        </label>
        <label>
          <input type="checkbox" checked={includeLowercase} onChange={e => setIncludeLowercase(e.target.checked)} /> Include Lowercase Letters
        </label>
        <label>
          <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} /> Include Numbers
        </label>
        <label>
          <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} /> Include Symbols
        </label>
      </div>

      <button onClick={generatePassword} style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}>
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
