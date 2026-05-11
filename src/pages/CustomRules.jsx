import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dailyRules } from '../data/rules';
import './Landing.css';

function CustomRules() {
  const { customRules, updateRules } = useContext(AuthContext);
  const [editingRules, setEditingRules] = useState(customRules);
  const navigate = useNavigate();

  const handleRuleChange = (index, field, value) => {
    const newRules = [...editingRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setEditingRules(newRules);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateRules(editingRules);
    navigate('/app');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to the original Momentum 5 rules?")) {
      setEditingRules(dailyRules);
    }
  };

  return (
    <div className="landing-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
        <Settings size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>Custom Rules</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '4rem' }}>
          Your challenge. Your rules. Define your own 5 daily non-negotiables below.
        </p>

        <form onSubmit={handleSave} style={{ textAlign: 'left' }}>
          {editingRules.map((rule, index) => (
            <div key={rule.id} className="rule-card" style={{ marginBottom: '2rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Rule #{index + 1} Title</label>
                <input 
                  type="text" 
                  value={rule.title}
                  onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Description</label>
                <textarea 
                  value={rule.description}
                  onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
                  required
                />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={handleReset} className="cta-button" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RotateCcw size={20} /> RESET TO DEFAULT
            </button>
            <button type="submit" className="cta-button" style={{ flex: 2, background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={20} /> SAVE CUSTOM RULES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomRules;
