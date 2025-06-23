export function extractHockeyTeams() {
  return Array.from(document.querySelectorAll("tr.team")).map(row => {
    const get = cls => row.querySelector(`.${cls}`)?.innerText.trim() || '';
    return {
      name: get("name"),
      year: get("year"),
      wins: get("wins"),
      losses: get("losses"),
      ot_losses: get("ot-losses"),
      win_pct: get("pct"),
      goals_for: get("gf"),
      goals_against: get("ga"),
      goal_diff: get("diff")
    };
  });
}
