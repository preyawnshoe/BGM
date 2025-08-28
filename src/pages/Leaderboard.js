import React, { useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import tw from "twin.macro";

const Container = tw.div`min-h-screen p-8 flex justify-center`;
const Card = tw.div`w-full max-w-3xl bg-white shadow rounded p-6`;
const Title = tw.h1`text-2xl font-bold mb-4`;
const Table = tw.table`w-full`;
const Th = tw.th`text-left border-b p-2`; 
const Td = tw.td`border-b p-2`;

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => setRows(d.leaderboard || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <AnimationRevealPage>
      <Container>
        <Card>
          <Title>Referral Leaderboard</Title>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Referrals</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.email}>
                  <Td>{i + 1}</Td>
                  <Td>{r.name}</Td>
                  <Td>{r.email}</Td>
                  <Td>{r.referrals}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Container>
    </AnimationRevealPage>
  );
}






