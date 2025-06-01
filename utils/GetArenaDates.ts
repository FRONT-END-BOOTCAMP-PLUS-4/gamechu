export function GetArenaDates(startDate: Date) {
    const debateEnd = new Date(startDate);
    debateEnd.setTime(startDate.getTime() + 30 * 60 * 1000); // Debate ends 30 minutes after startDate

    const voteEnd = new Date(debateEnd);
    voteEnd.setTime(debateEnd.getTime() + 24 * 60 * 60 * 1000); // Voting ends 24 hours after debate ends

    return {
        debateEndDate: debateEnd,
        voteEndDate: voteEnd,
    };
}
