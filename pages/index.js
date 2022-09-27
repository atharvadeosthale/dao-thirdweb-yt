import { ConnectWallet, useAddress, useContract } from "@thirdweb-dev/react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Proposal from "../components/Proposal";
import styles from "../styles/Home.module.css";

export default function Home() {
  const address = useAddress();
  const [proposals, setProposals] = useState([]);
  const [proposalDescription, setProposalDescription] = useState("");
  const { contract: token, isLoading: isTokenLoading } = useContract(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS
  );
  const { contract: vote, isLoading: isVoteLoading } = useContract(
    process.env.NEXT_PUBLIC_VOTE_ADDRESS
  );

  const getProposals = async () => {
    if (!address || isVoteLoading) return;
    const data = await vote.getAll();
    setProposals(data);
  };

  const createProposal = async () => {
    await vote.propose(proposalDescription);
    window.location.reload();
  };

  const checkDelegate = async () => {
    if (isTokenLoading || !address) return;
    const delegation = await token.getDelegation();
    if (delegation !== address) {
      await token.delegateTo(address);
      window.location.reload();
    }
  };

  useEffect(() => {
    getProposals();
  }, [address, isVoteLoading]);

  useEffect(() => {
    checkDelegate();
  }, [isTokenLoading]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ width: "200px" }}>
        <ConnectWallet />
      </div>

      {address && (
        <>
          <div>
            <input
              type="text"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Description"
            />
            <button disabled={isVoteLoading} onClick={createProposal}>
              Create Proposal
            </button>
          </div>

          <div>
            {proposals?.map((proposal) => (
              <Proposal
                proposalId={proposal.proposalId}
                description={proposal.description}
                key={proposal.proposalId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
