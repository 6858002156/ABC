import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockApi } from '@/lib/mockApi';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
 const [user,setUser]=useState(null); const [isLoadingAuth,setLoadingAuth]=useState(true); const [isLoadingPublicSettings,setLoadingSettings]=useState(true);
 useEffect(()=>{ mockApi.auth.me().then(setUser).finally(()=>{setLoadingAuth(false);setLoadingSettings(false);}); },[]);
 const logout=(redirect=true)=>{setUser(null); if(redirect) window.location.assign('/login');};
 const checkUserAuth=async()=>setUser(await mockApi.auth.me());
 const checkAppState=async()=>{};
 return <AuthContext.Provider value={{user,isAuthenticated:Boolean(user),isLoadingAuth,isLoadingPublicSettings,authError:null,appPublicSettings:{},authChecked:true,logout,navigateToLogin:()=>window.location.assign('/login'),checkUserAuth,checkAppState}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within an AuthProvider');return context;};
