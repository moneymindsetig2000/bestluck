
import React, { useState, useEffect, useCallback } from 'react';
import ChatPage from './pages/ChatPage';
import LandingPage from './pages/LandingPage';
import { loadPuterSDK, ensurePuterToken, safePuterFs, getSettingsDirForUser } from './lib/puterUtils';
import type { Subscription } from './lib/puterUtils';

declare global {
  interface Window {
    puter: any;
  }
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthState = useCallback(async () => {
    setIsAuthChecking(true);
    
    const DEFAULT_FREE_PLAN: Omit<Subscription, 'periodStartDate' | 'periodEndDate'> = {
        plan: 'free',
        requestsUsed: 0,
        requestsLimit: 60, // Source of truth for free plan limit
    };

    try {
      await ensurePuterToken();
      const puterUser = await window.puter.auth.getUser();
      if (puterUser) {
        setUser({
          uid: puterUser.uuid || puterUser.uid || puterUser.sub,
          displayName: puterUser.name || puterUser.username || null,
          photoURL: puterUser.avatar || null,
        });

        // Check for or create subscription record
        const settingsDir = getSettingsDirForUser(puterUser);
        const subPath = `${settingsDir}/subscription.json`;
        try {
          const blob = await safePuterFs.read(subPath);
          const content = await blob.text();
          let subData = JSON.parse(content) as any; // Read as 'any' to handle old/new structures
          let needsUpdate = false;
          const now = Date.now();
          
          // Data Migration: Check for old structure and add date fields if missing
          if (typeof subData.periodEndDate === 'undefined' || typeof subData.periodStartDate === 'undefined') {
              console.log('Old subscription format detected. Migrating to new date-based format.');
              const newStartDate = now;
              const newEndDate = new Date(newStartDate);
              newEndDate.setDate(newEndDate.getDate() + 30);
              
              subData.periodStartDate = newStartDate;
              subData.periodEndDate = newEndDate.getTime();
              // Reset requests used on migration to give user a fresh start for the period
              subData.requestsUsed = 0; 
              delete subData.expires; // Clean up old field if it exists
              needsUpdate = true;
          } else if (now > subData.periodEndDate) {
              // 1. Check for subscription period reset on existing, valid structures
              console.log('Subscription period expired, resetting.');
              const newStartDate = now;
              const newEndDate = new Date(newStartDate);
              newEndDate.setDate(newEndDate.getDate() + 30);
              
              subData = {
                  ...subData,
                  requestsUsed: 0,
                  periodStartDate: newStartDate,
                  periodEndDate: newEndDate.getTime(),
              };
              needsUpdate = true;
          }

          // 2. Check if plan configuration is outdated (e.g., free limit changed)
          if (subData.plan === 'free' && subData.requestsLimit !== DEFAULT_FREE_PLAN.requestsLimit) {
            console.log(`Updating free plan request limit from ${subData.requestsLimit} to ${DEFAULT_FREE_PLAN.requestsLimit}.`);
            subData.requestsLimit = DEFAULT_FREE_PLAN.requestsLimit;
            needsUpdate = true;
          }

          // If any changes were made, write the file back
          if (needsUpdate) {
            await safePuterFs.write(subPath, JSON.stringify(subData));
            console.log('Subscription file updated with new values.');
          }

          setSubscription(subData as Subscription);
          console.log('Found existing subscription:', subData);
        } catch (error) {
          // Assuming error means file doesn't exist, create it.
          console.log('No subscription found, creating default free plan.');
          const startDate = Date.now();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);

          const newSub: Subscription = { 
            ...DEFAULT_FREE_PLAN,
            periodStartDate: startDate,
            periodEndDate: endDate.getTime(),
          };
          await safePuterFs.mkdir(settingsDir, { createMissingParents: true });
          await safePuterFs.write(subPath, JSON.stringify(newSub));
          setSubscription(newSub);
        }

        document.body.style.overflowY = 'hidden';
      } else {
        setUser(null);
        setSubscription(null);
        document.body.style.overflowY = 'auto';
      }
    } catch (error) {
      console.error('checkAuthState failed:', error);
      setUser(null);
      setSubscription(null);
      document.body.style.overflowY = 'auto';
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    loadPuterSDK().then(() => {
      checkAuthState();
    }).catch(err => {
      console.error("Puter SDK failed to load:", err);
      setError(err.message || "Failed to load core components.");
      setIsAuthChecking(false);
    });
  }, [checkAuthState]);

  const handleLogin = async () => {
    try {
      await window.puter.auth.signIn();
      await checkAuthState();
    } catch (error: any) {
      console.log("Puter sign-in process was not completed:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await window.puter.auth.signOut();
      setUser(null);
      setSubscription(null);
      document.body.style.overflowY = 'auto';
    } catch (error) {
      console.error("Puter sign-out process failed.", error);
      alert("Sign-out failed. Please try again.");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (error) {
    return (
       <div className="flex items-center justify-center h-screen bg-black text-red-400 p-4">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (user && subscription) {
    return <ChatPage user={user} subscription={subscription} setSubscription={setSubscription} onLogout={handleLogout} />;
  }

  return <LandingPage onLogin={handleLogin} />;
};

export default App;