import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [customRules, setCustomRules] = useState([]);
  const [userData, setUserData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [dailyReflections, setDailyReflections] = useState({});
  const [teamMember, setTeamMember] = useState(null);
  
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        // Clear data on logout
        setCustomRules([]);
        setUserData({});
        setUserProfile(null);
        setDailyReflections({});
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      // Fetch Rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('custom_rules')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (rulesError) throw rulesError;
      
      if (rulesData && rulesData.length > 0) {
        setCustomRules(rulesData);
      } else {
        // Default rules if none exist
        const defaultRules = [
          { id: 'rule1', label: 'Do one scary or difficult task before you feel ready', sort_order: 1 },
          { id: 'rule2', label: 'Execute your daily discipline with zero motivation', sort_order: 2 },
          { id: 'rule3', label: 'Read 10 pages or listen to The Momentum Series', sort_order: 3 },
          { id: 'rule4', label: '10 minutes of journaling/reflection', sort_order: 4 },
          { id: 'rule5', label: 'Catch and eliminate "When I..." statements', sort_order: 5 }
        ];
        setCustomRules(defaultRules);
      }

      // Fetch Progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');
        
      if (progressError) throw progressError;

      // Transform array into nested object format: { dayNumber: { ruleId: true } }
      const formattedData = {};
      progressData?.forEach(row => {
        if (!formattedData[row.day_number]) {
          formattedData[row.day_number] = {};
        }
        formattedData[row.day_number][row.rule_id] = true;
      });
      
      setUserData(formattedData);

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!profileError && profileData) {
        setUserProfile(profileData);
        if (profileData.partner_id) {
          setTeamMember(profileData.partner_id);
        }
      }

      // Fetch Reflections
      const { data: reflectionData, error: reflectionError } = await supabase
        .from('daily_reflections')
        .select('*');
      
      if (!reflectionError && reflectionData) {
        const formattedReflections = {};
        reflectionData.forEach(row => {
          formattedReflections[row.day_number] = row.content;
        });
        setDailyReflections(formattedReflections);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRules = async (newRules) => {
    if (!user) return;
    
    try {
      // First, delete existing rules for this user to avoid conflicts
      await supabase.from('custom_rules').delete().eq('user_id', user.id);
      
      // Then insert new rules
      const rulesToInsert = newRules.map((rule, index) => ({
        id: rule.id,
        user_id: user.id,
        label: rule.label,
        sort_order: index + 1
      }));
      
      const { error } = await supabase.from('custom_rules').insert(rulesToInsert);
      if (error) throw error;
      
      setCustomRules(rulesToInsert);
    } catch (error) {
      console.error('Error updating rules:', error);
      alert('Failed to save rules. Please try again.');
    }
  };

  const toggleDayItem = async (dayIndex, itemId) => {
    if (!user) return;
    
    const dayData = userData[dayIndex] || {};
    const isCompleted = dayData[itemId];
    
    // Optimistic UI update
    setUserData(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [itemId]: !isCompleted
      }
    }));

    try {
      if (isCompleted) {
        // Delete record
        await supabase
          .from('user_progress')
          .delete()
          .match({ user_id: user.id, day_number: dayIndex, rule_id: itemId });
      } else {
        // Insert record
        await supabase
          .from('user_progress')
          .insert({ user_id: user.id, day_number: dayIndex, rule_id: itemId });
      }
    } catch (error) {
      console.error('Error toggling progress:', error);
      // Revert on failure
      setUserData(prev => ({
        ...prev,
        [dayIndex]: {
          ...prev[dayIndex],
          [itemId]: isCompleted
        }
      }));
    }
  };
  
  const resetProgress = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to fail and start over? This will permanently delete all your progress. Your rules will be kept.")) {
      try {
        await supabase.from('user_progress').delete().eq('user_id', user.id);
        await supabase.from('daily_reflections').delete().eq('user_id', user.id);
        await supabase.from('user_profiles').delete().eq('user_id', user.id);
        setUserData({});
        setDailyReflections({});
        setUserProfile(null);
      } catch (error) {
        console.error('Error resetting progress:', error);
      }
    }
  };

  const startChallenge = async (mode) => {
    if (!user) return;
    try {
      const inviteCode = generateInviteCode();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({ user_id: user.id, accountability_mode: mode, invite_code: inviteCode, timezone })
        .select()
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('Failed to start challenge. Please try again.');
    }
  };

  const updateProfileSettings = async (updates) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setUserProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  };

  const saveReflection = async (dayNumber, content) => {
    if (!user) return;
    
    // Optimistic
    setDailyReflections(prev => ({ ...prev, [dayNumber]: content }));
    
    try {
      const { error } = await supabase
        .from('daily_reflections')
        .upsert(
          { user_id: user.id, day_number: dayNumber, content: content },
          { onConflict: 'user_id, day_number' }
        );
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  // Auth Functions
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };
  
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const linkTeamMember = async (friendCode) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const { data, error } = await supabase.rpc('link_partner_by_code', { friend_code: friendCode });
      
      if (error) throw error;
      
      if (data === true) {
        // Fetch updated profile
        await fetchUserData(user.id);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid code or user not found' };
      }
    } catch (error) {
      console.error('Error linking accounts:', error);
      return { success: false, message: 'An error occurred' };
    }
  };

  const unlinkTeamMember = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ partner_id: null })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTeamMember(null);
      await fetchUserData(user.id);
    } catch (error) {
      console.error('Error unlinking account:', error);
    }
  };

  const value = {
    user,
    loading,
    customRules,
    userData,
    userProfile,
    dailyReflections,
    teamMember,
    updateRules,
    toggleDayItem,
    resetProgress,
    startChallenge,
    saveReflection,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    linkTeamMember,
    unlinkTeamMember,
    updateProfileSettings,
    inviteCode: userProfile?.invite_code || '------'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
