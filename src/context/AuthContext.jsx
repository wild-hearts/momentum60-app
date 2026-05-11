import React, { createContext, useState, useEffect } from 'react';
import { dailyRules } from '../data/rules';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [teamMember, setTeamMember] = useState(null);
  const [customRules, setCustomRules] = useState(dailyRules);

  useEffect(() => {
    const savedUser = localStorage.getItem('momentum60_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedTeam = localStorage.getItem('momentum60_team');
    if (savedTeam) {
      setTeamMember(savedTeam);
    }
    const savedRules = localStorage.getItem('momentum60_rules');
    if (savedRules) {
      setCustomRules(JSON.parse(savedRules));
    }
    
    // Generate an invite code for this session
    setInviteCode(Math.random().toString(36).substr(2, 6).toUpperCase());
  }, []);

  const login = (email, username) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), email, username };
    setUser(newUser);
    localStorage.setItem('momentum60_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setTeamMember(null);
    localStorage.removeItem('momentum60_user');
    localStorage.removeItem('momentum60_team');
  };

  const linkTeam = (friendCode) => {
    // Simulated DB link
    setTeamMember(friendCode);
    localStorage.setItem('momentum60_team', friendCode);
  };

  const updateRules = (newRules) => {
    setCustomRules(newRules);
    localStorage.setItem('momentum60_rules', JSON.stringify(newRules));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, inviteCode, teamMember, linkTeam, customRules, updateRules }}>
      {children}
    </AuthContext.Provider>
  );
};
