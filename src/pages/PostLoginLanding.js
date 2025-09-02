import React, { useEffect, useState } from "react";
import jwt_decode from "../helpers/jwt_decode";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import tw from "twin.macro";

const Container = tw.div`min-h-screen flex items-center justify-center bg-gray-100 p-6`;
const Card = tw.div`max-w-3xl w-full bg-white shadow rounded p-8 text-center`;
const Title = tw.h1`text-3xl font-extrabold`;
const Sub = tw.p`mt-2 text-gray-700`;
const Actions = tw.div`mt-8 flex flex-col sm:flex-row items-center justify-center gap-4`;
const Primary = tw.a`px-6 py-3 rounded bg-primary-500 text-white font-semibold`;
const Secondary = tw.a`px-6 py-3 rounded bg-gray-800 text-white font-semibold`;

export default function PostLoginLanding() {
  const [user, setUser] = useState(null);
  const [referralUrl, setReferralUrl] = useState("");

  useEffect(() => {
    // Try to get user from localStorage (email signup)
    let parsed = null;
    const u = localStorage.getItem('user');
    if (u) {
      try { parsed = JSON.parse(u); } catch { parsed = null; }
    }
    // If not found, try to decode JWT (Google login)
    if (!parsed) {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          parsed = {
            name: decoded.name,
            email: decoded.email,
            referralCode: decoded.referralCode
          };
        } catch {}
      }
    }
    if (parsed) {
      setUser(parsed);
      const origin = window.location.origin;
      setReferralUrl(`${origin}/api/ref/${parsed.referralCode}`);
    }
  }, []);

  if (!user) {
    return (
      <AnimationRevealPage>
        <Container>
          <Card>
            <Title>Please log in</Title>
            <Sub><a href="/login">Go to Login</a></Sub>
          </Card>
        </Container>
      </AnimationRevealPage>
    );
  }

  return (
    <AnimationRevealPage>
      <Container>
        <Card>
          <Title>Welcome back, {user.name}</Title>
          <Sub>Use your unique referral link to register on Tikkl and earn credit for referrals.</Sub>
          <Actions>
            <Primary href={referralUrl} target="_blank" rel="noreferrer">Register on Tikkl (with referral)</Primary>
            <Secondary href="/dashboard">Go to Dashboard</Secondary>
          </Actions>
          <Sub tw="mt-6">Direct event page: <a href="https://tikkl.com/bgm/c/bgm26-hyd" target="_blank" rel="noreferrer">BGM Hyderabad 2026</a></Sub>
          <Sub tw="mt-2">Leaderboard: <a href="/leaderboard">View Top Referrers</a></Sub>
        </Card>
      </Container>
    </AnimationRevealPage>
  );
}






