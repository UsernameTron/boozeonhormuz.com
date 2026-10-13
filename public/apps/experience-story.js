// Written fictional character performance. Shared by the page and keepsake exports.
export const FICTION_LABEL = 'Fictional political satire — not a real statement, quote, recording, or event report.';

export const INTRO = {
  don: "Bring the family. We have a beautiful place for the family. Other hotels give you a key. Tiny little key. We give you a gold folder. Look at the size of it. That's ownership.",
};

export const QUESTIONS = [
  {
    id: 'welcome',
    title: 'What would make this your kind of place?',
    options: [
      { id: 'welcome-status', route: 'status', label: 'People knowing I belong here.', don: "You want recognition. I understand recognition. My name is on the roof. You can see it from the water. Yours goes on a little badge. Same idea. Different distance.", note: 'Badge holders do not hold property.', record: 'You asked to be recognized.' },
      { id: 'welcome-legacy', route: 'legacy', label: 'Something the family can share.', don: "Family. Good answer. They put one name on a reservation. One! What about everybody else? I had them add a whole page. Nobody leaves this family off the paperwork.", note: 'The family page is compulsory stationery.', record: 'You wanted something for the family.' },
      { id: 'welcome-scrutiny', route: 'scrutiny', label: 'Knowing what I would actually own.', don: "You want specifics. I love specifics. Waterfront. Gold clasp. Ninety-six pages. You don't get ninety-six pages for a thing that isn't there. Who prints that much?", note: 'The printer has no ownership interest either.', record: 'You asked what the offer actually includes.' },
    ],
  },
  {
    id: 'folder',
    title: 'Don hands you the gold folder. What do you check first?',
    options: [
      { id: 'folder-status', route: 'status', label: 'How my name looks on the front.', don: "The lettering people loved my name. Loved it. They asked if yours could go inside. I said no, give them the front. Down there. Below the price. I fought for that.", note: 'Customer names appear below amounts due.', record: 'You checked the lettering.' },
      { id: 'folder-legacy', route: 'legacy', label: 'Whether everyone gets a copy.', don: "Children should have their own copy. My people said one per room. One! Then the father gets the folder and everybody else gets his opinion. I said print more. I understand families.", note: 'Additional copies confer no additional rights.', record: 'You asked for family copies.' },
      { id: 'folder-scrutiny', route: 'scrutiny', label: 'The terms inside.', don: "You want to read it. Good. Very good. Ninety-six pages. I signed mine in four seconds. Four. And you want to sit here reading. Who's good at business?", note: 'He signed under “Payee.”', record: 'You chose to read the terms.' },
    ],
  },
  {
    id: 'welcome-party',
    title: 'What should the welcome party celebrate?',
    options: [
      { id: 'party-status', route: 'status', label: 'My new title.', don: "Admiral. Sounds good on you. We had captains. People wanted to see their boats. Nobody asks an admiral where the boat is. They assume other people are handling it.", note: 'Rank is decorative. Boat not included.', record: 'You requested a prestigious title.' },
      { id: 'party-legacy', route: 'legacy', label: 'Getting the whole family together.', don: "Everybody in one photograph. Beautiful. I put myself in the middle. People say, you're not in the family. Who got them all into the room? That's a father, frankly.", note: 'Founder occupies three reserved seats.', record: 'You wanted a family gathering.' },
      { id: 'party-scrutiny', route: 'scrutiny', label: 'Nothing until I see the details.', don: "No party yet? Fine. That's discipline. I like discipline. We'll keep the cake. My name's already on it. Your delay has been very good for the cake.", note: 'Celebration deferred. Sales presentation continues.', record: 'You deferred celebration pending details.' },
    ],
  },
  {
    id: 'comfort',
    title: 'What would put you at ease during the presentation?',
    options: [
      { id: 'comfort-status', route: 'status', label: 'A private table.', don: "Private table. Nobody sees you. Except me, on the screen. We put a screen at every private table. Bigger picture of me than you get in the public room. Privacy improved.", note: 'All screens carry the same presentation.', record: 'You requested privacy.' },
      { id: 'comfort-legacy', route: 'legacy', label: 'Time to talk it over with family.', don: "Talk it over. Take all the time. We have a family room. No clock in there. I took it out myself. People kept looking at the clock instead of the opportunity.", note: 'You may leave whenever you choose.', record: 'You asked for time to discuss it.' },
      { id: 'comfort-scrutiny', route: 'scrutiny', label: 'An independent accountant.', don: "Bring an accountant. Bring two. I have one right here. Independent thinker. Disagrees with practically everything I say. Very poor attitude for somebody whose chair I bought.", note: 'Chair ownership does not alter the figures.', record: 'You asked for an independent check.' },
    ],
  },
  {
    id: 'priority',
    title: 'What do you want the final document to make clear?',
    options: [
      { id: 'priority-status', route: 'status', label: 'Which privileges come with my name.', don: "Privileges. Absolutely. Your name gets a line. My name gets a page. Some people would give you nothing. I gave you a line on a page with me. Look how far you've come.", note: 'Privileges will be listed separately from ownership.', record: 'You requested a list of privileges.' },
      { id: 'priority-legacy', route: 'legacy', label: 'What this means for the family.', don: "We'll put the family in writing. Other people say family and forget you at checkout. I don't forget. Ask anybody in Accounts. They can find a person from a Christmas card.", note: 'The family provision appears beside the total.', record: 'You requested the family provision.' },
      { id: 'priority-scrutiny', route: 'scrutiny', label: 'The cost and proof of ownership.', don: "Cost and proof. Two requests. Most people just admire the clasp. But I welcome it. Put the numbers right in front of them, I said. In front. The clasp still closes.", note: 'Reviewing the figures creates no obligation.', record: 'You requested the cost and ownership evidence.' },
    ],
  },
];

export const TIERS = [
  {
    id: 'bronze', name: 'Bronze Bunker', tagline: 'A folder with somewhere to sit.', membershipMonthly: 99, principal: 20000, apr: 9.9, term: 10,
    features: ['One gold-effect presentation folder', 'A seat facing the founder’s portrait', 'Your name printed on the customer line'],
    don: "Bronze. Good metal. We paint it gold, so you don't have to explain the bronze. You get the folder, you get the chair. I keep the building. Everybody has something.",
    note: 'Folder: yours. Chair and building: ours.', promise: 'A place of your own in the presentation.',
  },
  {
    id: 'gold', name: 'Gold Folder Club', tagline: 'Your name, near a larger name.', membershipMonthly: 1499, principal: 120000, apr: 29.9, term: 99,
    features: ['Your name embossed beneath Don’s', 'Priority seating at the renewal desk', 'A gold clasp on the standard folder'],
    don: "Your name, right under mine. Smaller, obviously. You've just arrived. I built the place. Built—well, I chose the lettering. The builder wanted his name somewhere. Can you imagine?",
    note: 'Your name is on the invoice.', promise: 'A name that belongs on the property.',
  },
  {
    id: 'admiral', name: 'Admiral’s Circle', tagline: 'Command a view. Receive a bill.', membershipMonthly: 4999, principal: 780000, apr: 39.9, term: 99,
    features: ['An Admiral title printed on your folder', 'A marina-view seat in the sales office', 'A ceremonial key with no matching lock'],
    don: "Admiral. Highest table in the room. The key is enormous. Doesn't fit an ordinary door. You wouldn't want an ordinary door. What door does it fit? You're still thinking like Bronze.",
    note: 'Key has no lock. Title has no vessel.', promise: 'The authority to call this place yours.',
  },
];

export const AMENITIES = [
  { id: 'marina', name: 'Gold Folder Marina', category: 'Premium docking', x: 18, y: 30, promise: 'A berth worthy of your new title.', don: "Look at those yachts. You could be that close to a yacht. Right there, behind the rope. I chose a very low rope. Other places make you feel excluded. Knee height. You're practically aboard.", note: 'Berth reserved for viewing. Vessel not included.' },
  { id: 'cove', name: 'Quiet Money Cove', category: 'Private retreat', x: 44, y: 18, promise: 'The peace of having no distractions.', don: "Quietest cove anywhere. No announcements. No complaints. We moved the complaints desk across the water. The people over there are waving. Look how happy they are to see us.", note: 'The desk has requested a return boat.' },
  { id: 'terrace', name: 'Subpoena View Terrace', category: 'Panoramic hospitality', x: 71, y: 26, promise: 'A front-row seat when important people arrive.', don: "They come right up to the terrace. Papers in their hands. Very serious people. They ask for me by name. You pay extra at some places to be recognized like that.", note: 'Reception cannot decline personal service.' },
  { id: 'shrimp', name: 'Shrimp Tower Overlook', category: 'Welcome reception', x: 30, y: 55, promise: 'A welcome that reaches every guest.', don: "The shrimp go all the way to the top. Beautiful tower. They wanted to put some down where people could reach them. I said, then what are they looking up to?", note: 'The founder’s plate was filled before assembly.' },
  { id: 'pool', name: 'The Very Legal Infinity Pool', category: 'Waterfront wellness', x: 58, y: 48, promise: 'A view without an end in sight.', don: "Infinity. No end. I asked the builder, where does it end? He showed me a little drain. I said cover it. People don't pay for infinity to find out where it goes.", note: 'Water recirculates. So does the presentation.' },
  { id: 'exit', name: 'The Painted Exit', category: 'Architectural feature', x: 82, y: 62, promise: 'A departure you can admire from your seat.', don: "The exit, I designed that. Green sign, brass handle. Very convincing. People stand up just looking at it. Sit down, I say. We haven't installed the leaving part yet.", note: 'Decorative mural. Your real exit remains available.' },
  { id: 'bench', name: 'Counsel’s Crying Bench', category: 'Professional wellness', x: 14, y: 78, promise: 'A quiet place for your adviser to collect their thoughts.', don: "Counsel needed a minute. I gave him a bench. Whole bench. Now he sits out there for hours. Who else gives their lawyer a waterfront office and gets criticized for it?", note: 'The meter is still running.' },
  { id: 'cabana', name: 'Mrs. Biggly’s Silent Cabana', category: 'Quiet suite', x: 52, y: 80, promise: 'One room without the sales presentation.', don: "They asked for a room where they couldn't hear me. I said yes. Very generous of me. No speaker inside. I put it just outside the door. Compromise. Everybody wins.", note: 'Silence ends at the threshold.' },
];

export const QUOTES = [
  "They asked for transparency. I took the back off the brochure stand. You can see every brochure.",
  "I don't read reviews. I read the names. Very useful names. We still have their folders.",
  "Guests want a personal touch. I touched every photograph of me before we hung it.",
  "They wanted a safe in the room. I put my picture above it. Now it looks supervised.",
  "A man asked why the chairs face me. Where else would they face? Each other? They can do that at home.",
  "We have a complaints book. Beautiful binding. Opens about an inch. You really have to mean it.",
  "The accountant wanted a separate column. I gave him one. At the back of the ballroom. Can't see me from there.",
  "My signature is bigger than the terms. People notice that. They know which part to trust.",
];

export const TESTIMONIALS = [
  { quote: 'We asked for separate rooms. He gave us two folders.', credit: 'Fictional preview guests', note: 'Accommodation request remains open.' },
  { quote: 'He said he knew every guest by name. Mine was “Balance Forward.”', credit: 'Fictional Bronze member', note: 'Personal service supplied by Accounts.' },
  { quote: 'I mentioned my hearing aid. He brought a larger photograph.', credit: 'Fictional presentation attendee', note: 'Accessibility request was redirected to Branding.' },
  { quote: 'Five stars. There were five printed on the form. I circled “Please stop calling.”', credit: 'Fictional former prospect', note: 'Published by the founder as an unqualified endorsement.' },
];

export const CONCIERGE = [
  { id: 'ownership', question: 'Does the folder make me an owner?', don: "It makes you a person with an ownership folder. Says it on the front. Big letters. People walk past a deed and don't even look. They look at this.", note: 'A folder is not a deed.' },
  { id: 'leave', question: 'Can I leave the presentation?', don: "Of course you can leave. Nobody said you couldn't leave. I will still be talking. That's freedom. You have your freedom and I have the microphone.", note: 'No purchase. No penalty. Use the real exit.' },
  { id: 'preview', question: 'What does the $249 preview mean?', don: "Three nights. Four days. Two hundred forty-nine dollars. Say the days first. People like days. Then the number. By then they're picturing the towels. I picked very large towels.", note: 'Fictional offer only. No booking or payment is available.' },
];

export const ENDINGS = {
  status: {
    title: 'A title without a title deed',
    don: "You wanted to belong. Look at your name on that folder. Your name. Now look at mine on the building. Both in gold. Different sizes, but let's not get petty. Keep the folder closed. Looks stronger closed.",
    note: 'Folder supplied. Ownership unchanged.',
    promise: 'Your name belongs here. Don’s building still belongs to Don.',
  },
  legacy: {
    title: 'The family stays on the account',
    don: "You wanted something for the family. Other places forget you when you go. I don't. Payments left? We find the family. We find them. People say you can't take it with you. Fine. Give me the next address.",
    note: 'Remaining balance: transferable. Ownership: zero.',
    promise: 'The holiday ends. The payments don’t.',
  },
  scrutiny: {
    title: 'The missing deed has been noted',
    don: "The deed. People get very excited about a deed. We have figures. We have terms. You could frame the folder. Gold clasp. Beautiful. Nobody comes into your house and asks to look inside the frame.",
    note: 'Deed not supplied. Folder supplied.',
    promise: 'An impressive document. No property conveyed.',
  },
};

export const DEFAULT_ENDING = {
  title: 'An open folder. No obligation.',
  don: "Just looking? Look. I built a whole place for people to look. Start with the folder. Beautiful outside. Inside, the accountant put numbers. He does that. You can put it down whenever you like. Heavy, isn't it?",
  note: 'An illustration, not a purchase. Nothing signed.',
  promise: 'A tour of the offer, with the figures left visible.',
};

export const REFUND = {
  don: "You want a refund. A refund for what? The ownership says zero. Zero! Now suddenly it's worth money. See how they do it? I'm the one being robbed here.",
  note: 'Fictional dispute fee added: $250.',
};

export function financeDialogue(term) {
  const years = Number(term);
  if (years === 99) {
    return {
      don: "Ninety-nine years. Nobody offers ninety-nine. A man says, ‘Sir, I'm seventy.’ I said, ‘You have children?’ Suddenly he's quiet. Thinking about his children. Beautiful. I did that.",
      note: 'Next of kin is a billing field.',
    };
  }
  if (!Number.isFinite(years) || years < 1) {
    return { don: "Pick the years. Take your time. The number matters. That's why I put a person with a calculator between you and me.", note: 'Choose a valid term to see the figures.' };
  }
  if (years <= 10) {
    return {
      don: `${years} ${years === 1 ? 'year' : 'years'}. You like to get things over with. I respect that. Then you can sit back and admire the folder. People ask, what did you get? You hold it up. Very simple.`,
      note: `Term: ${years} ${years === 1 ? 'year' : 'years'}. Paying it off does not produce a deed.`,
    };
  }
  return {
    don: `${years} years. Look how much time I'm giving you. People complain about the interest. I gave them years and they're complaining about the interest. Put the total over there. It needs a wider box.`,
    note: `Term: ${years} years. The total includes every payment.`,
  };
}
