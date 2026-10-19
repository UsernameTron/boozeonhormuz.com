export const fictionLabel = 'Fictional political satire — not a real statement, quote, recording, or event report.';
interface Episode { id: string; title: string; shortTitle: string; department: string; synopsis: string; note: string; stageLine: string; video: string | null; poster: string | null; duration: string; ratio: string; width: number; height: number; transcript?: string[]; summaryNote?: string; }
// Creator-described summaries, not invented transcripts. Import actual media before setting these paths.
export const episodes: Episode[] = [
  { id:'welcome', title:'Welcome to McTrumps', shortTitle:'The welcome', department:'Brand standards', synopsis:'A close-up of Don in clown makeup welcomes you to McTrumps. The burger comes with two patties, onions and lawsuits. He has been asked to stop mentioning the lawsuits. He finds this very sad.', note:'The onions passed legal review.', stageLine:'Two patties. Onions. A conversation with counsel.', video:'/mctrumps/welcome.mp4', poster:'/mctrumps/welcome.webp', duration:'0:39', ratio:'720 / 1280', width:720, height:1280 },
  { id:'birthday', title:'Billy’s Birthday. Don’s Business.', shortTitle:'The birthday', department:'Leadership development', synopsis:'Don sits in the ball pit with Billy, turning Grandma’s birthday money into a leadership consulting fee. The party develops an alarming amount of paperwork. Billy has several reasons to stop signing.', note:'The ball pit has a collections department.', stageLine:'A birthday party with a closing statement.', video:'/mctrumps/birthday.mp4', poster:'/mctrumps/birthday.webp', duration:'0:35', ratio:'960 / 960', width:960, height:960 },
  { id:'supervision', title:'Working Under Supervision', shortTitle:'The employment record', department:'Human resources', synopsis:'Don holds court at a desk in the McTrumps lobby. His probation officer will not give him credit for working. Don’s solution: buy the restaurant.', note:'He acquired the employer. The requirement remained.', stageLine:'He bought the job. Attendance sold separately.', video:'/mctrumps/supervision.mp4', poster:'/mctrumps/supervision.webp', duration:'0:46', ratio:'960 / 734', width:960, height:734 },
  { id:'appreciation', title:'Employee Appreciation Day', shortTitle:'The bonus', department:'Payroll', synopsis:'Don names himself Employee of the Month, asks the staff to buy his plaque, and keeps their appreciation fund as a performance bonus. Payroll requests clarification. Everyone receives a souvenir.', note:'Staff funded the recognition. Don recognized the funds.', stageLine:'Everybody contributes. One man collects.', video:'/mctrumps/appreciation.mp4', poster:'/mctrumps/appreciation.webp', duration:'0:52', ratio:'960 / 840', width:960, height:840, transcript:[
    'Employee Appreciation Day. Tremendous day. Very important. Especially for me.',
    'They said, “Sir, we should recognize the employees.”',
    'I said, “Absolutely. Start with your best one.”',
    'So I named myself Employee of the Month. Unanimous decision. I was the only judge. Very qualified.',
    'Beautiful plaque. Solid gold-looking. I told the staff, “You buy it. It\'s an honor to contribute.”',
    'They passed around an envelope. Everybody gave something. Some gave twenty. Some gave fifty. One gave nothing. We\'re looking into him.',
    'Then payroll said, “Sir, that\'s the employee appreciation fund.”',
    'I said, “Correct. And I\'m the employee being appreciated.”',
    'So I kept the envelope. Performance bonus. Tax people will figure it out.',
    'And the staff? They got something much more valuable.',
    'A photograph of me holding their money.',
    'Unsigned. I\'m not running a charity.',
  ]},
  { id:'tehran', title:'The Tehran Franchise', shortTitle:'The expansion', department:'International development', synopsis:'The same clown, the same desk, a McTrumps lobby in Tehran. Don admires marble bars on the playground and remains spectacularly out of touch with the scene around him.', note:'He inspected the finish. That was the inspection.', stageLine:'Marble bars. A very exclusive playground.', video:'/mctrumps/tehran.mp4', poster:'/mctrumps/tehran.webp', duration:'0:33', ratio:'960 / 734', width:960, height:734 },
  { id:'premium-costs', title:'Premium Costs', shortTitle:'The premium', department:'Revenue development', synopsis:'A simple drive-through order becomes a tariff briefing. Don prices the burger at $39, offers a premium AI cow, and finds several new ways to charge for lunch.', note:'China pays. Your card goes first.', stageLine:'China pays. You tap your card.', video:'https://github.com/UsernameTron/boozeonhormuz.com/releases/download/site-media-2026-10-19/premium-costs.mp4', poster:'/mctrumps/premium-costs.webp', duration:'2:23', ratio:'1080 / 1080', width:1080, height:1080, summaryNote:'Scene summary from the finished video.' },
  { id:'chief-accountability-officer', title:'Jeff, Chief Accountability Officer', shortTitle:'The new executive', department:'Corporate accountability', synopsis:'Don announces that he has taken responsibility, then introduces Jeff as McTrumps’ new Chief Accountability Officer. Yesterday’s cleaner now answers questions about the entire company.', note:'He has the title. Don has the exit.', stageLine:'All the responsibility. Someone else’s name tag.', video:'https://github.com/UsernameTron/boozeonhormuz.com/releases/download/site-media-2026-10-19/chief-accountability-officer.mp4', poster:'/mctrumps/chief-accountability-officer.webp', duration:'0:41', ratio:'1080 / 1080', width:1080, height:1080, summaryNote:'Scene summary from the finished video.' },
];
export const departments = [
  { id: 'customer-relations', title: 'Customer Relations', description: 'Birthday money. Burger money. Don considers both available.', episodeIds: ['birthday', 'premium-costs'] },
  { id: 'corporate-leadership', title: 'Corporate Leadership', description: 'Don collects the bonus. Someone else gets the title.', episodeIds: ['supervision', 'appreciation', 'chief-accountability-officer'] },
  { id: 'international-expansion', title: 'International Expansion', description: 'New territory. Same signature on both sides.', episodeIds: ['tehran'] },
];
export const programmeSeconds = episodes.reduce((total, episode) => {
  const [minutes, seconds] = episode.duration.split(':').map(Number);
  return total + minutes * 60 + seconds;
}, 0);
export const programmeDuration = `${Math.floor(programmeSeconds / 60)} minutes ${programmeSeconds % 60} seconds`;
export const complaints = [
  { question:'Can I see an itemized receipt?', don:'Of course. Beautiful receipt. Burger. Onions. My name. Biggest item. They wanted a total. I said, “People know what they paid. They need to know who to thank.”', note:'The total is on the back. Under his signature fee.' },
  { question:'Where did the employee appreciation fund go?', don:'Look at the photograph. I’m holding the envelope. You can see where it went. That’s transparency. They want the money back too? Always another benefit.', note:'Proof of receipt. For the recipient.' },
  { question:'Is there someone above the manager?', don:'There’s a portrait above the manager. Me. If you don’t like the answer down here, look up. Same man. Better lighting. That’s escalation.', note:'Your complaint has been forwarded to the frame.' },
];
export const relatedBusinesses = [
  { name: 'Hormuz Premium Yacht Fuel', description: 'Full tank. No chain of custody.' },
  { name: 'Discovery Shredding Co.', description: 'Documents handled. Memories discouraged.' },
  { name: 'Panic Room Realty', description: 'The panic room counts as a second bedroom.' },
  { name: 'Legal-Ish Insurance Group', description: 'Covers everything except what actually happened.' },
];
