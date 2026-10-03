import {Link} from 'react-router-dom';
const answers=[
 ['What do I do each day?','Choose one practice, give it a familiar cue, and record it when you do it. Set a smaller version too: a paragraph instead of ten pages, for example. Either version counts.'],
 ['What if I miss a day?','Return to today. Earlier actions stay recorded. There is no forced restart and no catch-up requirement.'],
 ['Do I have to listen or write?','No. Music and reflection are optional. Your action counts without either.'],
 ['What does the monthly subscription include?','The 60-day programme, its album, a journal and repeat seasons. It renews monthly until cancelled. A 60-day programme can cross more than two billing dates. The store shows the price before you buy.'],
 ['What happens after day 60?','Review your completed season, archive it and begin another with your existing practice. Repeat seasons use the same programme and album; a subscription does not promise new monthly content.'],
 ['Can I pause?','You can pause the programme in Today. Your day count pauses, but your monthly subscription continues. To stop renewal, use Settings and billing.'],
 ['Do I need to buy the books?','No. The practice, album and journal work without buying a book.'],
 ['Is a personal song included?','No. Personal-song rewards belong to the earlier challenge and are available only to eligible earlier participants under their original offer.'],
 ['What happens when I cancel?','Your paid access continues through its paid period. Your saved history remains readable afterwards. Cancel with the provider where you subscribed, shown in Settings and billing.'],
 ['Does it work offline?','Previously loaded history and recovered drafts may be available on this device. Recording actions, loading your practice and checking subscription access need a connection. Music streams online. Check that a reflection says Saved before relying on its online copy.'],
 ['Where is Team Up?','Partner sharing is unavailable in this release while its privacy controls are improved.'],
 ['How do I get help?','Email info@themomentumrule.com with what happened and your device type. Never send your password or private journal text.']
];
export default function FAQ(){return <main className="app-container"><h1>How Momentum 60 works</h1>{answers.map(([q,a])=><section key={q}><h2>{q}</h2><p>{a}</p></section>)}<p><Link to="/settings">Settings and billing</Link> · <Link to="/delete-account">Account deletion</Link></p></main>}
