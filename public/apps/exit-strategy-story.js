/* Fictional political satire — not a real statement, quote, recording, or event report. */
export const FICTION_LABEL = 'Fictional political satire — not a real statement, quote, recording, or event report.';
export const ROUTE_LEVELS = ['l1', 'l2', 'l3', 'l4', 'l5', 'l7', 'l8', 'l9'];
export const CFG = {
  egoStart: 50, realityStart: 40, stars: 3,
  sulkAt: 20, overflowAt: 95, lockAt: 80,
  starEffect: { ego: 10, reality: -35 },
  overflowEffect: { ego: -30, reality: 4 },
  flatterDecay: [-10, -6, -3],
  l6: { drainMs: 1000, drainPerTick: 1, calmCostPerCommit: 4, acceptAt: 18, floor: 20, capAfter: 75 },
};

const beat = (who, text) => ({ t: 'beat', who, text });
const pitch = (route, label, ego, reality, react, reply, receipt) => ({
  kind: 'advance', route, label, effects: { ego, reality }, react, reply, receipt,
  counts: { rebrands: 1, ...(route === 'revenue' ? { emergenciesMonetized: 1, feesAttempted: 1 } : {}) },
});
const reject = (label, failBeat) => ({ kind: 'fail', label, effects: { ego: -8, reality: 10 }, failBeat });
const flatter = (label, text) => ({ kind: 'flatter', label, effects: { ego: 7 }, beat: text });
const choice = (id, prompt, options) => ({ t: 'choice', id, prompt, options });
const aftermath = (text) => beat('crew', text);

export const LEVELS = [
  { id: 1, title: 'The Lifeboat', status: 'Taking on water. Still taking payments.',
    prop: ['Passenger manifest', '40 seats. One man requesting all of them.', 'BOARDING OPEN'],
    script: [
      { t: 'doors' },
      beat('crew', 'The lifeboat seats forty. Your life jacket is free.'),
      beat('biggly', 'Forty? I don’t do group survival. Group survival is coach.'),
      choice('l1', 'Get him aboard. Sell the service, or sell his importance.', [
        pitch('revenue', 'Bundle the life jacket with membership.', 10, 8,
          'The life jackets are complimentary. Pulling the cord renews your membership.',
          'They have already pulled the cords.', 'SURVIVAL: AUTO-RENEWING'),
        pitch('status', 'Make him honorary captain.', 6, -8,
          'Give them all honorary titles. I want forty captains and one person doing the work.',
          'That would be me, sir.', '39 TITLES. ONE PAIR OF OARS.'),
        reject('Call it a very safe rescue boat.', 'Rescue is admitting the original product tried to kill you.'),
        flatter('Say the ocean requested him personally.', 'At last. A body of water with a hiring strategy.'),
      ]),
      aftermath('He gets in. The lifeboat is ready to leave.'),
    ] },
  { id: 2, title: 'The Gold Trim Incident', status: 'The gold is paint. The water is water.',
    prop: ['Luxury inspection', 'Gold trim: unavailable. Working hull: available.', 'ONE COSMETIC OBJECTION'],
    script: [
      beat('crew', 'The trim isn’t real gold. The boat still floats.'),
      beat('biggly', 'Then why does it look like a rescue? I have a reputation to outlive.'),
      choice('l2', 'He is stepping back onto the ship. Give the missing trim a purpose.', [
        pitch('revenue', 'Sell gold trim as an upgrade.', 8, 6,
          'The hull is included. Looking rescued costs extra.',
          'It is the same boat.', 'APPEARANCE FEE ADDED'),
        pitch('status', 'Declare this the founder’s prototype.', 5, -6,
          'Unfinished? Prototype. Guests get the tested version. I get the photo.',
          'Please test the seat.', 'FOUNDER APPROVED'),
        reject('Explain that gold makes boats heavier.', 'So does responsibility. I’ve had both removed.'),
        flatter('Say the gold would distract from him.', 'Exactly. I won’t be upstaged by a railing.'),
      ]),
      aftermath('He sits down. You have negotiated with a chair and won.'),
    ] },
  { id: 3, title: 'The Yacht Annex', status: 'Same dinghy. Revised ownership structure.',
    prop: ['Occupancy report', 'One occupied seat. Thirty-nine opportunities.', 'SCARCITY UNDER REVIEW'],
    script: [
      beat('crew', c => c.l1 === 'revenue' ? 'The passengers are disputing their survival subscriptions.' : 'The honorary captains would like to know who is steering.'),
      beat('biggly', 'Keep them occupied. An informed passenger is a refund with shoes.'),
      choice('l3', 'He wants the lifeboat to feel exclusive. Choose the explanation.', [
        pitch('revenue', 'Charge for the empty seats.', 8, 6,
          'Empty seats aren’t vacancies. They’re subscriptions that haven’t learned to complain.',
          'There is nobody in them.', 'VACANCY RECLASSIFIED AS REVENUE'),
        pitch('status', 'Close membership immediately.', 5, -8,
          'Put everyone on a waiting list. If rescue is available to anyone, what exactly have I achieved?',
          'I am still taking everyone ashore.', 'EXCLUSIVITY: ENTIRELY CEREMONIAL'),
        reject('Call it a shared public resource.', 'Public is private with a clerical error.'),
        flatter('Name this boat the flagship.', 'Good. Put the flag where it blocks the questions.'),
      ]),
      aftermath('The passengers leave on the other boats. He remains busy with the paperwork.'),
    ] },
  { id: 4, title: 'Unauthorized Competitors', status: 'Rescue continues without a licensing agreement.',
    prop: ['Harbor invoice', 'Other lifeboats: moving. Authorization: not requested.', 'UNLICENSED COMPETENCE'],
    script: [
      beat('crew', 'The other lifeboats are heading for shore.'),
      beat('biggly', 'They’re fleeing without settling their accounts. Somehow I’m the emergency.'),
      choice('l4', 'He wants to stop their departure. Redirect him.', [
        pitch('revenue', 'Invoice them for brand adjacency.', 9, 8,
          'They survived near me. That’s an association. Put it on the invoice.',
          'The invoice is the only thing we’re sending back.', 'ADJACENCY FEE DISPUTED'),
        pitch('status', 'Appoint them his honorary escort fleet.', 5, -6,
          'An escort fleet. Much better than a record of people voluntarily moving away from me.',
          'They are moving toward land.', 'ESCORT HEADING INDEPENDENTLY ASHORE'),
        reject('Explain that saving people takes priority.', 'Priority is a product. I’m asking who bought it.'),
        flatter('Tell him his boat photographs larger.', 'Then measure all the boats in photographs.'),
      ]),
      aftermath(c => c.l3 === 'revenue' ? 'The empty seats have generated no payments.' : 'The waiting list is ashore. Every name on it.'),
    ] },
  { id: 5, title: 'The Route', status: 'The free exit is three feet away. Billing is closer.',
    prop: ['Departure receipt', 'Memorial surcharge: pending. Eligibility: to be established.', 'ADDED BEFORE THE FACT'],
    script: [
      beat('crew', 'We can still leave. The exit is free.'),
      beat('biggly', 'Add a memorial surcharge. We can establish eligibility later.'),
      choice('l5', 'The fee is on the receipt. Decide whose receipt.', [
        pitch('revenue', 'Bundle it into the evacuation charge.', 10, 10,
          'Bill it in advance. Bereavement is a terrible time to ask for card details.',
          'Nobody has died, sir.', 'MEMORIAL SURCHARGE: PASSENGER ACCOUNTS'),
        pitch('status', 'Put it on Don’s personal patron tab.', 6, -8,
          'A patron. Good. Put my name above everyone I paid for. Small names. Large me.',
          'Your card, sir. Your bill.', 'MEMORIAL SURCHARGE: DON’S PERSONAL TAB'),
        reject('Remove the charge entirely.', 'We haven’t even held the memorial and already you’re cutting jobs.'),
        flatter('Say the receipt deserves his signature.', 'Finally, a passenger document with the right name on it.'),
      ]),
      aftermath('He returns to the ship to authorize the paperwork. You follow him up the stairs.'),
    ] },
  { id: 6, title: 'The Staircase', status: 'Six steps. No naming-rights agreement.',
    prop: ['Access sign', 'EMERGENCY STAIRS', 'REBRAND REQUIRED'],
    script: [
      beat('crew', 'Six steps. Then the final departure deck.'),
      beat('biggly', 'I don’t take stairs. I authorize upward mobility.'),
      { t: 'setpiece' },
      aftermath('He climbs. You are now six steps closer to finishing this conversation.'),
    ] },
  { id: 7, title: 'The Announcement', status: 'All passengers ashore. Public relations still aboard.',
    prop: ['Crew announcement', 'All passengers are safe. Remaining crew are leaving now.', 'READY TO BROADCAST'],
    script: [
      beat('crew', 'All passengers are safe. The remaining crew are leaving now.'),
      beat('biggly', 'Don’t announce survival until legal decides whether we guaranteed it.'),
      choice('l7', 'Get him to follow the crew. He needs a reason he can announce.', [
        pitch('revenue', 'Close the final boarding window.', 8, 8,
          'Look how fast they leave when we threaten another invoice. Customer engagement with a pulse.',
          'They were leaving anyway.', 'BOARDING WINDOW CLOSED'),
        pitch('status', 'Announce his farewell procession.', 5, -8,
          'A farewell procession. Anyone who leaves before me is staff. Anyone after me is a fan.',
          'There is nobody after you.', 'PROCESSION: ONE PARTICIPANT'),
        reject('Read the evacuation announcement verbatim.', 'Stop saying abandoned. That ship is under new emptiness.'),
        flatter('Say everyone is clearing his sightline.', 'That’s leadership. You shouldn’t have to see the people.'),
      ]),
      aftermath(c => c.l1 === 'revenue' ? 'The membership-renewal receipts are ashore with their very living recipients.' : 'The honorary captains have left their badges. All of them are safe.'),
    ] },
  { id: 8, title: 'The Ballroom', status: 'Waterfront property. Internally.',
    prop: ['Venue appraisal', 'Dance floor: underwater. Human occupancy: zero.', 'RENT REVISION PENDING'],
    script: [
      beat('crew', 'The ballroom is flooded. We need to leave.'),
      beat('biggly', 'It’s finally waterfront. Raise the rent before somebody dries it.'),
      choice('l8', 'He wants an opening ceremony. Choose where he stands.', [
        pitch('revenue', 'Launch the underwater venue.', 18, 22,
          'Charge for the view. Then charge for the air. I don’t want anyone thinking we’ve gone all-inclusive.',
          'The venue is empty. It is staying empty.', 'VENUE CLOSED. INVOICES OPEN.'),
        pitch('status', 'Cut the ribbon from the departure deck.', 6, -4,
          'A remote opening. I get the applause without sharing the liability.',
          'There is no audience left.', 'RIBBON CUT AT A SAFE DISTANCE'),
        reject('Cancel the ceremony.', 'You can’t cancel a disaster. The deposits have cleared.'),
        flatter('Say his reflection doubles the attendance.', 'Count both of me. They’re both very supportive.'),
      ]),
      aftermath(c => c.l4 === 'revenue' ? 'The harbor returns the adjacency invoice, marked UNREQUESTED.' : 'The honorary escort fleet radios in. It has successfully escorted itself home.'),
    ] },
  { id: 9, title: 'The Waiver', status: 'One lawyer aboard. Notice already given.',
    prop: ['Liability waiver', 'Passengers retain their rights. Decorative seals change nothing.', 'LEGAL REVIEW COMPLETE'],
    script: [
      beat('crew', 'The lawyer wrote this to protect the passengers.'),
      beat('biggly', 'That sounds like a conflict of interest.'),
      choice('l9', 'He wants the waiver to erase consequences. Offer a fiction he can frame.', [
        pitch('revenue', 'Sell a family claims opt-out.', 12, 12,
          'That waiver is your family’s unsubscribe button.',
          'It has no legal effect.', 'LEGALLY DECORATIVE'),
        pitch('status', 'Appoint him honorary appeals commissioner.', 7, -6,
          'I appoint myself the appeals process. Finally, a department that understands what I meant.',
          'Also no legal effect.', 'APPOINTMENT NOT RECOGNIZED'),
        reject('Ask him to accept responsibility.', 'Personally? I thought that was what subsidiaries were for.'),
        flatter('Compliment the space reserved for his signature.', 'Keep it blank for now. Accountability has terrible resale.'),
      ]),
      aftermath('The lawyer leaves through the free exit. The final crew member follows. Both are safe.'),
    ] },
  { id: 10, title: 'The Departure', status: 'Everyone else is safe. Approval aboard: 100%.',
    prop: ['Final manifest', 'Passengers and crew: ashore. Don: still aboard. Exit: three feet.', 'ONE VOLUNTARY HOLDOUT'],
    script: [
      beat('narrator', 'Every passenger and crew member is safe. Don is beside the same free exit.'),
      beat('biggly', 'No complaints. No questions. This is the first competent room I’ve ever been in.'),
      { t: 'doors', final: true },
      { t: 'finale' },
    ] },
];

export const L6_BANKS = [
  { legend: 'Modifier', tiles: [{ w: 'EXECUTIVE', v: 7 }, { w: 'PRESIDENTIAL', v: 9 }, { w: 'PLATINUM', v: 8 }, { w: 'EMERGENCY', v: -12 }, { w: 'STANDARD', v: -5 }] },
  { legend: 'Movement', tiles: [{ w: 'VERTICAL DEPARTURE', v: 6 }, { w: 'ASCENSION', v: 7 }, { w: 'EGRESS', v: -2 }, { w: 'ESCAPE', v: -4 }, { w: 'STAIRS', v: -8 }] },
  { legend: 'Suffix', tiles: [{ w: 'EXPERIENCE', v: 6 }, { w: 'COLLECTION', v: 5 }, { w: 'PROTOCOL', v: -3 }, { w: 'SITUATION', v: -6 }] },
];

export const textFor = (text, choices) => typeof text === 'function' ? text(choices) : text;
export function finaleLine(choices) {
  return choices.l5 === 'status'
    ? 'Everyone survived? Then why the fuck am I the only one with a bill?'
    : 'Everyone survived? Then what the fuck is the memorial surcharge for?';
}
export function routeVerdict(choices) {
  const revenue = Object.values(choices).filter(v => v === 'revenue').length;
  return revenue >= 5 ? 'SURVIVAL, NOW WITH FEES' : revenue <= 2 ? 'HONORARY CAPTAIN. ACTUAL HOLDOUT.' : 'EVERYTHING EXCEPT AN EXIT STRATEGY';
}
// Shuffle once per decision and voyage. Retries and flattery preserve the order.
export function orderedOptions(options, seed) {
  const ordered = options.map((option, index) => ({ ...option, id: String(index) }));
  let s = (seed >>> 0) || 0x9e3779b9;
  for (let i = ordered.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  return ordered;
}
