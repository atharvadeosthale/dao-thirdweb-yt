import { useAddress, useContract } from "@thirdweb-dev/react";
import { VoteType } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

export default function Proposal({ proposalId, description }) {
  const [votes, setVotes] = useState({ for: 0, against: 0, abstain: 0 });
  const [hasVoted, setHasVoted] = useState(true);
  const address = useAddress();

  const { contract: token, isLoading: isTokenLoading } = useContract(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS
  );
  const { contract: vote, isLoading: isVoteLoading } = useContract(
    process.env.NEXT_PUBLIC_VOTE_ADDRESS
  );

  const getProposalData = async () => {
    if (isVoteLoading) return;
    const voted = await vote.hasVoted(proposalId, address);
    setHasVoted(voted);
    const votes = await vote.getProposalVotes(proposalId);
    setVotes({
      against: ethers.utils.formatEther(votes[0].count),
      for: ethers.utils.formatEther(votes[1].count),
      abstain: ethers.utils.formatEther(votes[2].count),
    });
  };

  useEffect(() => {
    getProposalData();
  }, [isVoteLoading]);

  const voteFor = () => {
    castVote(VoteType.For);
  };

  const voteAgainst = () => {
    castVote(VoteType.Against);
  };

  const voteAbstain = () => {
    castVote(VoteType.Abstain);
  };

  const castVote = async (voteType) => {
    await vote.vote(proposalId, voteType);
    window.location.reload();
  };

  return (
    <div>
      {description}
      <button disabled={hasVoted} onClick={voteFor}>
        For {votes.for}
      </button>
      <button disabled={hasVoted} onClick={voteAgainst}>
        Against {votes.against}
      </button>
      <button disabled={hasVoted} onClick={voteAbstain}>
        Abstain {votes.abstain}
      </button>
    </div>
  );
}
