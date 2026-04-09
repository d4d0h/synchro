'use client';

import { useState, useRef, useEffect } from 'react';
import { useGoogleAuth } from '@/lib/googleAuth';
import { LogOut, Loader2, ShieldCheck, Edit3, Save, X } from 'lucide-react';

export function GoogleSignIn() {
    const { user, customName, customAvatar, setCustomProfile, signIn, signOut, isLoading } = useGoogleAuth();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const currentName = customName || user?.name || 'Anonymous';
    const currentAvatar = customAvatar || user?.picture || '';
    
    const [editName, setEditName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // For now, avatar editing can just rely on name changing (or we can add input if needed later)
    
    const handleSave = () => {
        setCustomProfile(editName || null, customAvatar);
        setIsEditing(false);
    };

    const handleSignOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        signOut();
    };

    if (user) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                    {currentAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={currentAvatar}
                            alt={currentName}
                            width={28}
                            height={28}
                            className="rounded-full w-7 h-7 object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {currentName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm font-medium text-zinc-200 hidden sm:block max-w-[160px] truncate">
                        {currentName}
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50">
                        {isEditing ? (
                            <div className="space-y-3">
                                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Display Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder={user.name}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="flex-1 bg-primary text-white py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                        <Save className="w-3.5 h-3.5" /> Save
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-zinc-800 text-zinc-300 py-1.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-zinc-700">
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/50">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{currentName}</div>
                                        <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { 
                                        setEditName(customName || user.name); 
                                        setIsEditing(true); 
                                    }}
                                    className="w-full flex items-center gap-3 px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-lg group transition-colors"
                                >
                                    <Edit3 className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-2 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {isLoading ? (
                <div className="text-center animate-pulse">
                    <h3 className="text-xl font-bold text-white mb-1">Choose an account</h3>
                    <p className="text-sm text-zinc-400 max-w-[240px] leading-relaxed">
                        Sign in with your <span className="text-primary font-medium">Luma Gmail login</span> to continue to Synchro
                    </p>
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mt-4" />
                </div>
            ) : (
                <button
                    onClick={signIn}
                    className="px-6 py-2.5 rounded-lg bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-primary/10 flex items-center gap-2"
                >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Sign In
                </button>
            )}
        </div>
    );
}
