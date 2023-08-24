export class Members {
  constructor(id, name, score, attacks, factionID) {
    this.id = id;
    this.name = name;
    this.score = score;
    this.attacks = attacks;
    this.factionID = factionID;
  }
}

export class Faction {
  constructor(id, name, score, attacks, members) {
    this.id = id;
    this.name = name;
    this.score = score;
    this.attacks = attacks;
    this.members = members.map(
      (member) =>
        new Members(
          member.id,
          member.name,
          member.score,
          member.attacks,
          member.factionID
        )
    );
  }
}
