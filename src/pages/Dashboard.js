import React, { useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import tw from "twin.macro";

const Container = tw.div`min-h-screen p-6 sm:p-10 bg-gray-100`;
const Shell = tw.div`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6`;
const Sidebar = tw.aside`bg-white shadow rounded p-4`; 
const Main = tw.main`lg:col-span-3`;
const Card = tw.div`bg-white shadow rounded p-6 mb-6`;
const Title = tw.h1`text-2xl font-bold mb-4`;
const Para = tw.p`mb-2`;
const Input = tw.input`w-full px-3 py-2 border rounded`;
const Button = tw.button`mt-3 px-4 py-2 bg-primary-500 text-white rounded`;
const LinkBtn = tw.a`inline-block mt-3 px-4 py-2 bg-gray-800 text-white rounded`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [referralUrl, setReferralUrl] = useState("");
  const [referrals, setReferrals] = useState(0);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      const origin = window.location.origin;
      setReferralUrl(`${origin}/api/ref/${parsed.referralCode}`);
      setReferrals(parsed.referrals || 0);
    }
  }, []);

  if (!user) return (
    <AnimationRevealPage>
      <Container>
        <Card>
          <Title>Please log in</Title>
          <Para><a href="/login">Go to Login</a></Para>
        </Card>
      </Container>
    </AnimationRevealPage>
  );

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    alert('Referral link copied');
  };

  const refreshStats = async () => {
    // Simple refresh: re-login to get updated counts
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      setReferrals(data.user.referrals || 0);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AnimationRevealPage>
      <Container>
        <Shell>
          <Sidebar>
            <Title tw="text-xl">Navigation</Title>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/leaderboard">Leaderboard</a></li>
              <li><a href="/ref-success?token=demo" title="For testing">Record Success (Test)</a></li>
            </ul>
            <Button onClick={logout} tw="mt-6 bg-gray-700">Logout</Button>
          </Sidebar>
          <Main>
            <Card>
              <Title>Welcome, {user.name}</Title>
              <Para>Email: {user.email}</Para>
              <Para>Referral Code: {user.referralCode}</Para>
            </Card>

            <Card>
              <Title>Your Referral Link</Title>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <Input readOnly value={referralUrl} style={{ flex: 1 }} />
                <Button onClick={copy} style={{ whiteSpace: 'nowrap' }}>Copy Link</Button>
              </div>
              <div>
                <LinkBtn href={`/api/ref/${user.referralCode}`} target="_blank" rel="noreferrer">Register on Tikkl (with referral)</LinkBtn>
              </div>
              <Para tw="mt-4">Or register directly: <a href="https://tikkl.com/bgm/c/bgm26-hyd" target="_blank" rel="noreferrer">Event Page</a></Para>
            </Card>

            <Card>
              <Title>Your Stats</Title>
              <Para>Successful registrations via your link: <b>{referrals}</b></Para>
              <Button onClick={refreshStats}>Refresh</Button>
            </Card>
          </Main>
        </Shell>
      </Container>
    </AnimationRevealPage>
  );
}


