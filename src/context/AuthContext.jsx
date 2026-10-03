import { cancelDailyReminder } from '../utils/notifications';
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { createJournalQueue } from '../lib/journalQueue';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * A last-known-good copy of what the signed-in person has done, kept per user
 * id so two accounts on one phone cannot see each other's streak. Written on
 * every successful fetch, read only when a fetch fails.
 */
const SNAPSHOT_PREFIX = 'm60:snapshot:';

function cacheSnapshot(userId, patch) {
  if (!userId) return;
  try {
    const key = SNAPSHOT_PREFIX + userId;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...existing, ...patch, at: Date.now() }));
  } catch {
    // Private browsing, or a full disk. Not worth breaking the app over.
  }
}

function readSnapshot(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(SNAPSHOT_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const draftKey = (id, day, season) => `momentum60:draft:${id}:${season}:${day}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = useRef(null);
  const progressWrites = useRef(new Set());
  const [saveError, setSaveError] = useState(null);

  const journalQueue = useRef(null);
  const seasonRequest = useRef(null);
  const activeSeason = useRef(null);
  const fetchEpoch = useRef(0);
  const journalEdits = useRef({});
  const journalDirty = useRef({});
  const [journalStatus, setJournalStatus] = useState({});

  // Data state
  const [customRules, setCustomRules] = useState([]);
  const [userData, setUserData] = useState({});
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [dailyReflections, setDailyReflections] = useState({});
  const [teamMember, setTeamMember] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const owner = user.id;
    const queue = createJournalQueue({
      write: async (day, draft) => {
        const { content, season } = draft;
        if (currentUserId.current !== owner) throw new Error('Session changed');
        const { data, error } = await supabase.from('daily_reflections')
          .upsert({ user_id: owner, day_number: Number(day), content, season_started_at: season }, { onConflict: 'user_id, day_number' })
          .select('day_number');
        if (error || data?.length !== 1) throw error || new Error('Save not confirmed');
        if (currentUserId.current === owner) {
          try {
            if (localStorage.getItem(draftKey(owner, day, season)) === content) localStorage.removeItem(draftKey(owner, day, season));
          } catch { /* Draft can remain until a later successful save. */ }
        }
      },
      status: (day, state) => {
        if (state === 'saved') delete journalDirty.current[`${owner}:${day}`];
        if (currentUserId.current === owner) setJournalStatus(prev => ({ ...prev, [day]: state }));
      }
    });
    journalQueue.current = queue;
    return () => { queue.close(); journalQueue.current = null; };
  }, [user?.id, userProfile?.start_date]);

  useEffect(() => {
    const warn = event => {
      if (Object.values(journalStatus).some(state => state !== 'saved')) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [journalStatus]);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const fetchUserData = useCallback(async (userId) => {
    const epoch = ++fetchEpoch.current;
    const current = () => epoch === fetchEpoch.current && currentUserId.current === userId;
    const editsAtStart = { ...journalEdits.current };
    const dirtyAtStart = { ...journalDirty.current };
    const restored = {};
    const restoredSeason = activeSeason.current || readSnapshot(userId)?.userProfile?.start_date;
    for (let day = 1; day <= 60; day++) {
      try {
        const draft = localStorage.getItem(draftKey(userId, day, restoredSeason));
        if (draft !== null) restored[day] = draft;
      } catch { /* Device storage may be disabled. */ }
    }
    if (!current()) return;
    setDailyReflections(prev => ({ ...restored, ...prev }));
    setJournalStatus(prev => ({ ...prev, ...Object.fromEntries(Object.keys(restored).map(day => [day, 'restored'])) }));
    setLoading(true);
    try {
      // Fetch Rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('custom_rules')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!current()) return;
      if (rulesError) throw rulesError;

      if (rulesData && rulesData.length > 0) {
        setCustomRules(rulesData);
      } else {
        // Default rules if none exist
        const defaultRules = [
          { id: 'rule1', label: 'Do one scary or difficult task before you feel ready', sort_order: 1 },
          { id: 'rule2', label: 'Execute your daily discipline with zero motivation', sort_order: 2 },
          { id: 'rule3', label: 'Read 10 pages or listen to The Momentum Series', sort_order: 3 },
          { id: 'rule4', label: '10 minutes of journaling/reflection (e.g., write down one win and one lesson from today)', sort_order: 4 },
          { id: 'rule5', label: 'Examine the excuses you used today that held you back, and write down how you will overcome them tomorrow', sort_order: 5 }
        ];
        setCustomRules(defaultRules);
      }

      // Fetch Progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (!current()) return;
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
      cacheSnapshot(userId, { userData: formattedData });

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!current()) return;
      if (!profileError && profileData) {
        if (restoredSeason && restoredSeason !== profileData.start_date) {
          journalQueue.current?.close();
          for (const key of Object.keys(restored)) delete restored[key];
          setDailyReflections({}); setJournalStatus({});
          journalDirty.current = {}; journalEdits.current = {};
        }
        activeSeason.current = profileData.start_date;
        setUserProfile(profileData);
        cacheSnapshot(userId, { userProfile: profileData });
        if (profileData.partner_id) {
          setTeamMember(profileData.partner_id);
        }
      }

      // Fetch Reflections
      const { data: reflectionData, error: reflectionError } = await supabase
        .from('daily_reflections')
        .select('*');

      if (!current()) return;
      if (!reflectionError && reflectionData) {
        const formattedReflections = {};
        reflectionData.forEach(row => {
          formattedReflections[row.day_number] = row.content;
        });
        setUsingCachedData(false);
        cacheSnapshot(userId, { dailyReflections: formattedReflections });
        setDailyReflections(prev => {
          if (!current()) return prev;
          for (let day = 1; day <= 60; day++) {
            if (dirtyAtStart[`${userId}:${day}`] || journalDirty.current[`${userId}:${day}`] || journalEdits.current[`${userId}:${day}`] !== editsAtStart[`${userId}:${day}`]) {
              formattedReflections[day] = prev[day] ?? '';
            } else if (Object.hasOwn(restored, day)) {
              formattedReflections[day] = restored[day];
            }
          }
          return formattedReflections;
        });
      }

    } catch {
      if (!current()) return;
      const cached = readSnapshot(userId);
      if (cached) {
        if (cached.userData) setUserData(cached.userData);
        if (cached.userProfile) { activeSeason.current = cached.userProfile.start_date; setUserProfile(cached.userProfile); }
        setDailyReflections(prev => {
          const merged = { ...cached.dailyReflections, ...restored };
          for (let day = 1; day <= 60; day++) {
            if (dirtyAtStart[`${userId}:${day}`] || journalDirty.current[`${userId}:${day}`] || journalEdits.current[`${userId}:${day}`] !== editsAtStart[`${userId}:${day}`]) merged[day] = prev[day] ?? '';
          }
          return merged;
        });
        setUsingCachedData(true);
      }
      if (current()) setSaveError('Your saved data could not be loaded. Recovered drafts remain available on this device.');

    } finally {
      if (current()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const nextId = session?.user?.id ?? null;
      if (currentUserId.current !== nextId) {
        journalQueue.current?.close();
        activeSeason.current = null;
        setCustomRules([]); setUserData({}); setUserProfile(null);
        setDailyReflections({}); setTeamMember(null); setJournalStatus({}); setUsingCachedData(false);
      }
      currentUserId.current = nextId;
      setSaveError(null);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextId = session?.user?.id ?? null;
      if (currentUserId.current !== nextId) {
        journalQueue.current?.close();
        activeSeason.current = null;
        setCustomRules([]); setUserData({}); setUserProfile(null);
        setDailyReflections({}); setTeamMember(null); setJournalStatus({}); setUsingCachedData(false);
      }
      currentUserId.current = nextId;
      setSaveError(null);
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
  }, [fetchUserData]);

  const updateRules = async (newRules) => {
    if (!user) return;

    try {
      const rulesToInsert = newRules.map((rule, index) => ({id:rule.id,user_id:user.id,label:rule.label,sort_order:index+1}));
      const {error} = await supabase.rpc('replace_momentum_rules',{rules:rulesToInsert});
      if (error) throw error;

      setCustomRules(rulesToInsert);
    } catch (error) {
      console.error('Error updating rules:', error);
      alert('Failed to save rules. Please try again.');
    }
  };

  const toggleDayItem = async (dayIndex, itemId) => {
    if (!user) return { success: false };
    const key = `${user.id}:${dayIndex}:${itemId}`;
    if (progressWrites.current.has(key)) return { success: false };
    if (!activeSeason.current) return { success: false };
    progressWrites.current.add(key);
    const isCompleted = Boolean(userData[dayIndex]?.[itemId]);
    setSaveError(null);
    try {
      const record = { user_id: user.id, day_number: dayIndex, rule_id: itemId, season_started_at: activeSeason.current };
      const result = isCompleted
        ? await supabase.from('user_progress').delete().match(record).select('id')
        : await supabase.from('user_progress').insert(record).select('id');
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error('Progress write was not confirmed');
      if (currentUserId.current !== user.id) return { success: false };
      setUserData(prev => ({
        ...prev,
        [dayIndex]: { ...prev[dayIndex], [itemId]: !isCompleted }
      }));
      return { success: true };
    } catch {
      if (currentUserId.current === user.id) setSaveError('Your check-in could not be saved. Please try again.');
      return { success: false };
    } finally {
      progressWrites.current.delete(key);
    }
  };

  const resetProgress = async () => {
    if (!user) return { success: false };
    if (Object.values(journalStatus).some(state => state !== 'saved') || progressWrites.current.size) {
      setSaveError('Save your current entries before starting another season.');
      return { success: false };
    }
    if (!window.confirm('Archive this season and begin a new one? Your history will remain available in Your Journey.')) return { success: false };
    seasonRequest.current ||= crypto.randomUUID();
    try {
      const { data, error } = await supabase.rpc('archive_and_start_season', { request_id: seasonRequest.current });
      if (error || !data) throw error || new Error('Archive not confirmed');
      seasonRequest.current = null;
      await fetchUserData(user.id);
      setSaveError(null);
      return { success: true };
    } catch {
      setSaveError('The new season could not be confirmed. Your history has not been cleared by this app. Retry to check the same request.');
      return { success: false };
    }
  };

  const startChallenge = async (mode) => {
    if (!user) return;
    try {
      const inviteCode = generateInviteCode();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, accountability_mode: mode, invite_code: inviteCode, timezone }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      activeSeason.current = data.start_date;
      setUserProfile(data);
      return { success: true };
    } catch (error) {
      console.error('Error starting challenge:', error);
      setSaveError('Your season could not be started. Please retry.');
      return { success: false };
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

  const saveReflection = (dayNumber, content) => {
    if (!user || !journalQueue.current) return;
    const editKey = `${user.id}:${dayNumber}`;
    journalDirty.current[editKey] = true;
    journalEdits.current[editKey] = (journalEdits.current[editKey] || 0) + 1;
    setDailyReflections(prev => ({ ...prev, [dayNumber]: content }));
    try { localStorage.setItem(draftKey(user.id, dayNumber, activeSeason.current), content); }
    catch { setSaveError('This device cannot keep an offline journal draft. Keep this page open until your entry is saved.'); }
    journalQueue.current.enqueue(String(dayNumber), { content, season: activeSeason.current });
  };

  const retryReflection = (dayNumber) => {
    saveReflection(dayNumber, dailyReflections[dayNumber] || '');
    void journalQueue.current?.flush(String(dayNumber));
  };

  // Auth Functions
  // consent: { marketingOptIn: boolean }. Terms/privacy acceptance is required by the form before this is called.
  // Stored on the auth user so there is a timestamped record of what each person agreed to.
  const signUp = async (email, password, consent = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          terms_accepted_at: new Date().toISOString(),
          marketing_opt_in: Boolean(consent.marketingOptIn),
          consent_source: 'momentum60-signup'
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const owner = user?.id;
    let hasDraft = Object.values(journalStatus).some(state => state !== 'saved');
    if (owner) try { hasDraft ||= Object.keys(localStorage).some(key => key.startsWith(`momentum60:draft:${owner}:`)); } catch { /* Use in-memory status. */ }
    if (hasDraft && !window.confirm('Some journal text has not been saved online. Signing out removes this device’s drafts. Stay signed in to retry, or sign out and discard those drafts?')) return false;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    journalQueue.current?.close();
    await cancelDailyReminder();
    if (owner) try { for (const key of Object.keys(localStorage)) if (key.startsWith(`momentum60:draft:${owner}:`)) localStorage.removeItem(key); } catch { /* Storage unavailable. */ }
    return true;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://challenge.themomentumrule.com/update-password',
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
    refreshData: () => user && fetchUserData(user.id),
    saveError,
    loading,
    customRules,
    userData,
    userProfile,
    dailyReflections,
    journalStatus,
    retryReflection,
    teamMember,
    updateRules,
    toggleDayItem,
    resetProgress,
    startChallenge,
    saveReflection,
    signUp,
    signIn,
    signOut,
    usingCachedData,
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
