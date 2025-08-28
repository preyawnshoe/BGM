import React, { useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import tw from "twin.macro";

const Container = tw.div`min-h-screen flex items-center justify-center p-8`;
const Card = tw.div`w-full max-w-lg bg-white shadow rounded p-6 text-center`;
const Title = tw.h1`text-2xl font-bold mb-4`;
const Para = tw.p`mb-2`;

export default function ReferralSuccess() {
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('Missing token');
      return;
    }
    fetch('/api/ref/success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Failed');
        setStatus(`Thank you! Referral recorded. Total now: ${d.referrals}`);
      })
      .catch(e => setStatus(e.message));
  }, []);

  return (
    <AnimationRevealPage>
      <Container>
        <Card>
          <Title>Registration Complete</Title>
          <Para>{status}</Para>
          <Para><a href="/">Back to Home</a></Para>
        </Card>
      </Container>
    </AnimationRevealPage>
  );
}






