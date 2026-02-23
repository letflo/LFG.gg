"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Trophy, Wallet, LogOut } from "lucide-react";

export default function LFMgg() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [openMatches, setOpenMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [stake, setStake] = useState(100);
  const [gameMode, setGameMode] = useState("1v1 Box Fight");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.user) {
        setCurrentUser(d.user);
        fetchMatches();
      }
    });
  }, []);

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setOpenMatches(data.open || []);
  };

  const auth = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, isLogin })
    });
    const data = await res.json();
    if (data.user) {
      setCurrentUser(data.user);
      fetchMatches();
      setMessage(`Welcome, ${data.user.username}`);
    } else setMessage(data.error);
  };

  const createMatch = async () => {
    const res = await fetch("/api/matches", {
      method: "POST",
      body: JSON.stringify({ stake, gameMode })
    });
    const data = await res.json();
    if (data.success) fetchMatches();
  };

  const joinMatch = async (id) => {
    const res = await fetch("/api/matches/join", {
      method: "POST",
      body: JSON.stringify({ matchId: id })
    });
    if ((await res.json()).success) fetchMatches();
  };

  const resolve = async (matchId, winnerId) => {
    await fetch("/api/matches/resolve", {
      method: "POST",
      body: JSON.stringify({ matchId, winnerId })
    });
    fetchMatches();
  };

  const buy = async () => {
    const res = await fetch("/api/tokens/buy", { method: "POST" });
    const data = await res.json();
    if (data.success) setCurrentUser({ ...currentUser, balance: data.newBalance });
  };

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {!currentUser ? (
        <div className="max-w-md mx-auto bg-zinc-900 p-10 rounded-3xl border border-yellow-500/30">
          <h1 className="text-5xl font-bold text-yellow-400 text-center">LFM.gg</h1>
          <p className="text-center text-zinc-400 mt-2">Fortnite Wagers</p>
          <div className="mt-8 space-y-4">
            <input type="text" placeholder="Username" className="w-full bg-zinc-800 p-4 rounded-2xl" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-zinc-800 p-4 rounded-2xl" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={auth} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-bold">{isLogin ? "LOGIN" : "REGISTER"}</button>
            <p className="text-center text-sm cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account? Register" : "Already have one? Login"}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400">LFM.gg</h1>
            <div className="flex items-center gap-6">
              <div className="bg-zinc-900 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Wallet className="text-yellow-400" />
                <span className="text-2xl font-bold">{currentUser.balance}</span>
                <span>TOKENS</span>
              </div>
              <button onClick={buy} className="bg-green-600 px-6 py-3 rounded-2xl">+1000 FREE</button>
              <button onClick={logout} className="text-zinc-400">Logout</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Match */}
            <div className="bg-zinc-900 p-8 rounded-3xl">
              <h2 className="text-2xl mb-6 flex items-center gap-3"><Plus /> CREATE MATCH</h2>
              <input type="number" value={stake} onChange={e => setStake(Number(e.target.value))} className="w-full bg-black p-4 text-3xl rounded-2xl mb-4" placeholder="Stake" />
              <select value={gameMode} onChange={e => setGameMode(e.target.value)} className="w-full bg-black p-4 rounded-2xl mb-6">
                <option>1v1 Box Fight</option>
                <option>2v2 Realistics</option>
                <option>Zone Wars</option>
              </select>
              <button onClick={createMatch} className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-bold">LOCK {stake} TOKENS & CREATE</button>
            </div>

            {/* Open Matches */}
            <div className="lg:col-span-2 bg-zinc-900 p-8 rounded-3xl">
              <h2 className="text-2xl mb-6"><Users /> OPEN MATCHES ({openMatches.length})</h2>
              {openMatches.map(m => (
                <div key={m.id} className="bg-zinc-950 p-6 rounded-2xl mb-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{m.creatorUsername || "Someone"} vs ???</div>
                    <div className="text-sm text-zinc-400">{m.gameMode} • {m.stake} tokens</div>
                  </div>
                  <button onClick={() => joinMatch(m.id)} className="bg-white text-black px-8 py-3 rounded-2xl font-bold">JOIN</button>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Tokens Box */}
          <div className="mt-12 bg-zinc-900 p-8 rounded-3xl text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">💰 Buy Tokens (Real Money)</h2>
            <p className="text-xl mb-6">Send money → I add tokens in &lt;5 min</p>
            <div className="bg-black p-6 rounded-2xl text-2xl font-mono mb-4">CashApp: $YourTagHere</div>
            <div className="bg-black p-6 rounded-2xl text-2xl font-mono">PayPal: yourpaypa1@email.com</div>
            <p className="text-sm text-yellow-400 mt-6">DM me on Discord @letflo with proof + username</p>
            <p className="text-xs text-zinc-500 mt-2">$5 = 600 tokens • $20 = 3000 tokens (bonus)</p>
          </div>
        </div>
      )}
    </div>
  );
}
