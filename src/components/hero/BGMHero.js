import React, { useEffect, useState } from "react";
import { getCurrentUser } from "./auth";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line

import Header, { NavLink, NavLinks, PrimaryLink as PrimaryLinkBase, LogoLink, NavToggle, DesktopNavLinks } from "../headers/light.js";

const CountdownSection = tw.div`flex flex-col items-center mt-6 mb-2`;
const CountdownHeading = tw.div`text-lg sm:text-xl font-semibold text-white mb-3`;
const CountdownContainer = tw.div`flex justify-center items-center gap-6`;
const CountdownItemBox = tw.div`bg-white rounded-lg shadow flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-24`;
const CountdownNumber = tw.span`text-3xl sm:text-4xl font-bold text-primary-400`;
const CountdownLabel = tw.span`text-xs sm:text-sm text-gray-700 mt-1 uppercase tracking-wider`;


const StyledHeader = styled(Header)`
  ${tw`pt-8 max-w-none w-full`}
  ${DesktopNavLinks} ${NavLink}, ${LogoLink} {
    ${tw`text-gray-100 hover:border-gray-300 hover:text-gray-300`}
  }
  ${NavToggle}.closed {
    ${tw`text-gray-100 hover:text-primary-500`}
  }
`;

const PrimaryLink = tw(PrimaryLinkBase)`rounded-full`
const Container = styled.div`
  ${tw`relative -mx-8 -mt-8 bg-center bg-cover h-screen min-h-144`}
  background-image: url("https://dutvyzacdrh9k.cloudfront.net/assets/org/185/banners/banner_O8D7qJDq8x6mLK2Mrg8q_BGM_26_Banner.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const OpacityOverlay = tw.div`z-10 absolute inset-0 bg-black opacity-75`;

const HeroContainer = tw.div`z-20 relative px-6 sm:px-8 mx-auto h-full flex flex-col`;
const Content = tw.div`px-4 flex flex-1 flex-col justify-center items-center`;

const Heading = styled.h1`
  ${tw`text-3xl text-center sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-snug -mt-24 sm:mt-0`}
  span {
    ${tw`inline-block mt-2`}
  }
`;

const PrimaryAction = tw.a`rounded-full px-8 py-3 mt-10 text-sm sm:text-base sm:mt-16 sm:px-8 sm:py-4 bg-primary-500 text-gray-100 font-bold shadow transition duration-300 hocus:bg-primary-700 hocus:text-gray-200 focus:outline-none focus:shadow-outline`;
const SecondaryAction = tw.a`rounded-full px-8 py-3 mt-4 text-sm sm:text-base sm:px-8 sm:py-4 bg-gray-100 text-gray-900 font-bold shadow transition duration-300 hocus:bg-gray-200 focus:outline-none focus:shadow-outline`;
const LoginButton = tw.a`px-8 py-3 rounded bg-gray-100 text-gray-900 font-bold shadow transition duration-300 hocus:bg-gray-200 focus:outline-none focus:shadow-outline border-b-0`;
const Inline = tw.div`mt-6 w-full max-w-xl flex flex-col items-center`;
const RefRow = tw.div`w-full flex items-center gap-2`;
const RefInput = tw.input`flex-1 px-4 py-2 border rounded`;
const CopyButton = tw.button`ml-2 px-4 py-2 bg-primary-500 text-gray-100 rounded font-semibold shadow transition duration-300 hocus:bg-primary-700 focus:outline-none focus:shadow-outline`;
const Small = tw.p`mt-2 text-gray-200 text-sm`;
const ShareRow = tw.div`mt-4 flex gap-3 flex-wrap justify-center`;
const ShareButton = tw.a`rounded-full px-5 py-2 text-sm bg-gray-100 text-gray-900 font-semibold shadow transition duration-300 hocus:bg-gray-200 focus:outline-none focus:shadow-outline`;


export default function BGMHero() {
  const [user, setUser] = useState(null);
  const [referralUrl, setReferralUrl] = useState("");
  const [refParam, setRefParam] = useState("");
  const [shareLinks, setShareLinks] = useState({ whatsapp: "", twitter: "" });
  const [copied, setCopied] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [checkingTicket, setCheckingTicket] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown logic
  useEffect(() => {
    const target = new Date('2025-09-15T00:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for user (email or Google)
  useEffect(() => {
    const origin = window.location.origin;
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref') || "";
    setRefParam(refFromUrl);

    const parsed = getCurrentUser();
    if (parsed) {
      setUser(parsed);
      // Check if user has a verified ticket
      setCheckingTicket(true);
      fetch(`/api/ticket/user/${parsed._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.hasTicket) {
            setTicketSubmitted(true);
          } else {
            setTicketSubmitted(false);
          }
        })
        .catch(() => setTicketSubmitted(false))
        .finally(() => setCheckingTicket(false));

      setReferralUrl(`${origin}/signup?ref=${parsed.referralCode}`);

      const displayName = parsed.name || "me";
      const personalized = `Join ${displayName} at BGM 2026 Hyderabad! Register on Tikkl and use my referral link to sign up:`;
      const wa = `https://wa.me/?text=${encodeURIComponent(`${personalized} ${origin}/signup?ref=${parsed.referralCode}`)}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(personalized)}&url=${encodeURIComponent(`${origin}/signup?ref=${parsed.referralCode}`)}&hashtags=BGM2026,BITSAA`;
      setShareLinks({ whatsapp: wa, twitter: tw });
    } else if (refFromUrl) {
      setReferralUrl(`${origin}/signup?ref=${refFromUrl}`);

      const personalized = `Join me at BGM 2026 Hyderabad! Register on Tikkl using this referral link:`;
      const wa = `https://wa.me/?text=${encodeURIComponent(`${personalized} ${origin}/signup?ref=${refFromUrl}`)}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(personalized)}&url=${encodeURIComponent(`${origin}/signup?ref=${refFromUrl}`)}&hashtags=BGM2026,BITSAA`;
      setShareLinks({ whatsapp: wa, twitter: tw });
    }
  }, []);

  const handleCopy = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setTicketError("Please enter your Ticket ID.");
      return;
    }
    if (!user || !user._id) {
      setTicketError("User not found. Please login again.");
      return;
    }
    setTicketError("");
    try {
      // If the user was referred, pass the referral code for backend to increment referrer's count
      const referralCode = refParam || undefined;
      const res = await fetch('/api/ticket/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketId.trim(), userId: user._id, referralCode })
      });
      if (!res.ok) {
        const data = await res.json();
        setTicketError(data.error || 'Ticket verification failed');
        return;
      }
      setTicketSubmitted(true);
    } catch (err) {
      setTicketError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    const origin = window.location.origin;
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref') || "";
    setRefParam(refFromUrl);

    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      // Check if user has a verified ticket
      setCheckingTicket(true);
      fetch(`/api/ticket/user/${parsed._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.hasTicket) {
            setTicketSubmitted(true);
          } else {
            setTicketSubmitted(false);
          }
        })
        .catch(() => setTicketSubmitted(false))
        .finally(() => setCheckingTicket(false));

      setReferralUrl(`${origin}/signup?ref=${parsed.referralCode}`);

      const displayName = parsed.name || "me";
      const personalized = `Join ${displayName} at BGM 2026 Hyderabad! Register on Tikkl and use my referral link to sign up:`;
      const wa = `https://wa.me/?text=${encodeURIComponent(`${personalized} ${origin}/signup?ref=${parsed.referralCode}`)}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(personalized)}&url=${encodeURIComponent(`${origin}/signup?ref=${parsed.referralCode}`)}&hashtags=BGM2026,BITSAA`;
      setShareLinks({ whatsapp: wa, twitter: tw });
    } else if (refFromUrl) {
      setReferralUrl(`${origin}/signup?ref=${refFromUrl}`);

      const personalized = `Join me at BGM 2026 Hyderabad! Register on Tikkl using this referral link:`;
      const wa = `https://wa.me/?text=${encodeURIComponent(`${personalized} ${origin}/signup?ref=${refFromUrl}`)}`;
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(personalized)}&url=${encodeURIComponent(`${origin}/signup?ref=${refFromUrl}`)}&hashtags=BGM2026,BITSAA`;
      setShareLinks({ whatsapp: wa, twitter: tw });
    }
  }, []);

  const onLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    window.location.href = '/';
  };

  const navLinks = [
    user ? (
      <NavLinks key={1}>
        <PrimaryLink href="#" onClick={onLogout}>Logout</PrimaryLink>
      </NavLinks>
    ) : (
      <NavLinks key={2}>
        <LoginButton href="/login">Login</LoginButton>
      </NavLinks>
    )
  ];

  return (
    <Container>
      <OpacityOverlay />
      <HeroContainer>
        <StyledHeader links={navLinks} />
        <Content>
          <Heading>
            <span>BITSAA Global Meet</span>
            <br />
            <span>Hyderabad 2026</span>
          </Heading>
          {!(user && ticketSubmitted) && (
            <CountdownSection>
              <CountdownHeading>Early Bird Registration ends in</CountdownHeading>
              <CountdownContainer>
                <CountdownItemBox>
                  <CountdownNumber>{countdown.days}</CountdownNumber>
                  <CountdownLabel>Days</CountdownLabel>
                </CountdownItemBox>
                <CountdownItemBox>
                  <CountdownNumber>{countdown.hours}</CountdownNumber>
                  <CountdownLabel>Hours</CountdownLabel>
                </CountdownItemBox>
                <CountdownItemBox>
                  <CountdownNumber>{countdown.minutes}</CountdownNumber>
                  <CountdownLabel>Minutes</CountdownLabel>
                </CountdownItemBox>
                <CountdownItemBox>
                  <CountdownNumber>{countdown.seconds}</CountdownNumber>
                  <CountdownLabel>Seconds</CountdownLabel>
                </CountdownItemBox>
              </CountdownContainer>
            </CountdownSection>
          )}
          {user ? (
            <>
              {!ticketSubmitted && (
                <PrimaryAction href="https://tikkl.com/bgm/c/bgm26-hyd" target="_blank" rel="noreferrer">Get tickets on Tikkl</PrimaryAction>
              )}
              {checkingTicket ? (
                <Small>Checking ticket status...</Small>
              ) : (
                <Inline>
                  {ticketSubmitted ? null : (
                    <form onSubmit={handleTicketSubmit} style={{ width: "100%" }}>
                      <RefRow>
                        <RefInput
                          type="text"
                          placeholder="Enter your Ticket ID to join referral programme"
                          value={ticketId}
                          onChange={e => setTicketId(e.target.value)}
                        />
                        <CopyButton as="button" type="submit">Join</CopyButton>
                      </RefRow>
                      {ticketError && <Small style={{ color: '#f87171' }}>{ticketError}</Small>}
                    </form>
                  )}
                  {ticketSubmitted && (
                    <>
                      <RefRow>
                        <RefInput readOnly value={referralUrl} onFocus={e => e.target.select()} />
                        <CopyButton onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</CopyButton>
                      </RefRow>
                      <Small>Share this referral link: it will redirect users to signup with your referral code</Small>
                      <ShareRow>
                        <ShareButton href={shareLinks.whatsapp} target="_blank" rel="noreferrer">Share on WhatsApp</ShareButton>
                        <ShareButton href={shareLinks.twitter} target="_blank" rel="noreferrer">Share on Twitter</ShareButton>
                      </ShareRow>
                    </>
                  )}
                </Inline>
              )}
            </>
          ) : (
            <>
              <PrimaryAction href="/signup">Register to Get Referral Link</PrimaryAction>
              <SecondaryAction href="https://tikkl.com/bgm/c/bgm26-hyd" target="_blank" rel="noreferrer">Skip and Get tickets on Tikkl</SecondaryAction>
            </>
          )}
        </Content>
      </HeroContainer>
    </Container>
  );
}


