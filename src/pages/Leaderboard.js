
import React, { useEffect, useState } from "react";
import tw, { styled } from "twin.macro";
import { getCurrentUser } from "../helpers/auth";

const Container = tw.div`py-8 flex justify-center`;
const Card = tw.div`w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6`;
const Title = tw.h1`text-3xl font-extrabold mb-6 text-primary-700 text-center`;
const Table = tw.table`w-full text-base`;
const Th = tw.th`text-left border-b-2 p-3 font-semibold text-gray-700 bg-gray-500`;
const Td = tw.td`border-b p-3 align-middle`;
const Tr = styled.tr(({ highlight }) => [
  highlight && tw`bg-yellow-500`,
]);
const Avatar = styled.div(({ color }) => [
  tw`inline-flex items-center justify-center rounded-full font-bold text-lg mr-3`,
  `width: 2.5rem; height: 2.5rem; background: ${color}; color: white;`,
]);
const Medal = styled.span(({ place }) => [
  tw`inline-block text-2xl align-middle mr-2`,
  place === 1 && `color: #FFD700;`,
  place === 2 && `color: #C0C0C0;`,
  place === 3 && `color: #CD7F32;`,
]);

function getMedal(place) {
  if (place === 1) return <Medal place={1}>🥇</Medal>;
  if (place === 2) return <Medal place={2}>🥈</Medal>;
  if (place === 3) return <Medal place={3}>🥉</Medal>;
  return null;
}

function getAvatarColor(i) {
  const colors = ["#6366f1", "#f59e42", "#10b981", "#f43f5e", "#3b82f6", "#a21caf"];
  return colors[i % colors.length];
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => setRows(d.leaderboard || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Container>
      <Card>
        <Title>Referral Leaderboard</Title>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Referrals</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isCurrent = user && (user.email === r.email);
              return (
                <Tr key={r.email} highlight={isCurrent} style={i < 3 ? { fontWeight: 700, fontSize: '1.1em', background: '#fef9c3' } : {}}>
                  <Td>{getMedal(i + 1) || i + 1}</Td>
                  <Td>
                    <Avatar color={getAvatarColor(i)}>
                      {r.name ? r.name[0].toUpperCase() : '?'}
                    </Avatar>
                    {r.name}
                  </Td>
                  <Td>{r.email}</Td>
                  <Td>{r.referrals}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}






