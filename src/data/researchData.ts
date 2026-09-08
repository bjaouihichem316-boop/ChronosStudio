import { ResearchData } from '../types/research';

export const constantinopleResearchData: ResearchData = {
  notes: [
    {
      id: 'note-001',
      title: 'The Theodosian Walls — Engineering Marvel',
      content:
        'The Theodosian Walls were a triple defense system built during the reign of Theodosius II (408–450 CE). They consisted of an inner wall (12m high), an outer wall (8.5m high), and a moat. The walls stretched approximately 6.5 km and featured 96 towers. During the 1453 siege, Ottoman cannons under the direction of the Hungarian engineer Orban breached sections of this fortification that had stood for over a thousand years.',
      tags: ['fortifications', 'engineering', 'Byzantine'],
      dateAdded: '2024-01-20T09:00:00Z',
      dateModified: '2024-02-15T14:30:00Z',
    },
    {
      id: 'note-002',
      title: 'Mehmed II — The Conqueror',
      content:
        'Sultan Mehmed II was only 21 years old during the siege. He was highly educated, spoke multiple languages including Greek, Latin, Arabic, and Persian. He personally oversaw the construction of the Rumeli Hisarı fortress on the European side of the Bosphorus in 1452, strategically cutting off Constantinople from Genoese colonies to the north. His use of massive siege cannons — particularly the Basilic cannon designed by Orban — represented a revolutionary shift in military technology.',
      tags: ['Mehmed II', 'Ottoman', 'military', 'leadership'],
      dateAdded: '2024-01-22T11:00:00Z',
      dateModified: '2024-02-18T10:00:00Z',
    },
    {
      id: 'note-003',
      title: 'The Role of the Genoese — Giovanni Giustiniani',
      content:
        'Giovanni Giustiniani Longo arrived in Constantinople in January 1453 with 700 men. A renowned Genoese condottiero, he was placed in command of the land defenses. His leadership was crucial in repelling multiple Ottoman assaults during the 53-day siege. He was wounded on May 29, 1453, and his withdrawal from the walls — whether from injury or panic — may have been the turning point that led to the final breach.',
      tags: ['Genoese', 'Giustiniani', 'military', 'Western aid'],
      dateAdded: '2024-02-01T08:00:00Z',
      dateModified: '2024-02-01T08:00:00Z',
    },
    {
      id: 'note-004',
      title: 'The Fall as Geopolitical Turning Point',
      content:
        'The fall of Constantinople had cascading effects: it triggered the Age of Exploration as European powers sought alternative trade routes to Asia; it led to the migration of Greek scholars to Italy, fueling the Renaissance; it established Ottoman dominance over the Eastern Mediterranean for centuries; and it profoundly affected the relationship between Christian and Islamic civilizations. The city was renamed Istanbul (though this name existed in colloquial use before 1453).',
      tags: ['geopolitics', 'Renaissance', 'trade routes', 'consequences'],
      dateAdded: '2024-02-10T15:00:00Z',
      dateModified: '2024-03-01T09:00:00Z',
    },
    {
      id: 'note-005',
      title: 'Constantine XI Palaiologos — The Last Emperor',
      content:
        'Constantine XI became emperor in 1449 and was the last Byzantine ruler. He died fighting during the final assault on May 29, 1453, though his body was never definitively identified. He had attempted to reunite the Eastern Orthodox and Roman Catholic churches (Council of Florence, 1439) to secure Western military aid, but this was deeply unpopular among his subjects. His famous last words are reported as: "The city is fallen and I am still alive."',
      tags: ['Constantine XI', 'Byzantine', 'leadership', 'death'],
      dateAdded: '2024-02-14T10:00:00Z',
      dateModified: '2024-03-05T11:00:00Z',
    },
  ],
  claims: [
    {
      id: 'claim-001',
      title: 'Ottoman cannons breached walls that had stood for 1,000 years',
      description:
        'The massive siege cannons, particularly the Basilic designed by Orban, were able to breach the Theodosian Walls — a fortification system that had successfully defended Constantinople against numerous sieges for over a millennium. This represents a fundamental shift in the relationship between offensive and defensive military technology.',
      sourceIds: ['src-001', 'src-002', 'src-005'],
      status: 'verified',
      dateAdded: '2024-01-25T09:00:00Z',
      dateModified: '2024-02-20T14:00:00Z',
    },
    {
      id: 'claim-002',
      title: 'Constantinople had fewer than 7,000 defenders against 80,000+ Ottomans',
      description:
        'The defending force consisted of approximately 7,000 men (including about 2,000 foreigners) against an Ottoman army estimated between 80,000 and 100,000. This massive numerical disadvantage was compounded by the poor condition of the walls and the lack of sufficient gunpowder for the defenders\' own artillery.',
      sourceIds: ['src-001', 'src-003', 'src-004'],
      status: 'verified',
      dateAdded: '2024-01-28T10:00:00Z',
      dateModified: '2024-02-15T11:00:00Z',
    },
    {
      id: 'claim-003',
      title: 'The Kerkoporta gate was left open, enabling the final breach',
      description:
        'According to several accounts, a small postern gate known as the Kerkoporta was either left open or was breached, allowing Ottoman janissaries to enter the city. This gate, located in the Blachernae section of the walls, may have been the critical factor in the fall. However, some historians dispute whether this gate actually existed at this location or whether the story is apocryphal.',
      sourceIds: ['src-002', 'src-004', 'src-006'],
      status: 'disputed',
      dateAdded: '2024-02-02T14:00:00Z',
      dateModified: '2024-03-10T16:00:00Z',
    },
    {
      id: 'claim-004',
      title: 'The fall directly triggered the Italian Renaissance',
      description:
        'The flight of Greek scholars and manuscripts from Constantinople to Italy after 1453 significantly contributed to the Renaissance. However, this claim is debated — many scholars argue that the Renaissance was already well underway before 1453, and the migration of scholars was part of a longer process that began in the 14th century.',
      sourceIds: ['src-003', 'src-005', 'src-007'],
      status: 'disputed',
      dateAdded: '2024-02-08T11:00:00Z',
      dateModified: '2024-03-12T09:00:00Z',
    },
    {
      id: 'claim-005',
      title: 'Mehmed II allowed three days of looting before halting it',
      description:
        'After the city fell, Mehmed II traditionally granted his troops three days of looting as was Ottoman custom. However, he reportedly halted the pillage after only one day upon witnessing the destruction. He then entered the city and proceeded directly to the Hagia Sophia, which he converted into a mosque.',
      sourceIds: ['src-001', 'src-002'],
      status: 'verified',
      dateAdded: '2024-02-12T16:00:00Z',
      dateModified: '2024-02-28T10:00:00Z',
    },
    {
      id: 'claim-006',
      title: 'The "red apple" prophecy motivated Ottoman soldiers',
      description:
        'Ottoman tradition spoke of a "red apple" (kızıl elma) that symbolized the ultimate prize — Constantinople. This eschatological concept motivated generations of Ottoman warriors and gave the siege a quasi-religious dimension. The prophecy may have been used as propaganda to maintain troop morale during the lengthy siege.',
      sourceIds: ['src-006', 'src-007'],
      status: 'unverified',
      dateAdded: '2024-03-01T09:00:00Z',
      dateModified: '2024-03-01T09:00:00Z',
    },
  ],
  sources: [
    {
      id: 'src-001',
      title: 'The Histories — Laonikos Chalkokondyles',
      author: 'Laonikos Chalkokondyles',
      type: 'primary',
      reliability: 'high',
      year: 'c. 1464',
      url: '',
      notes:
        'Byzantine Greek historian who witnessed the fall firsthand. His "Demonstrations of Histories" provides one of the most detailed contemporary accounts of the siege. Written in the 1460s, it covers the rise of the Ottomans and the fall of Constantinople from a Byzantine perspective.',
      dateAdded: '2024-01-18T09:00:00Z',
    },
    {
      id: 'src-002',
      title: 'The Conquest of Constantinople 1453',
      author: 'Steven Runciman',
      type: 'secondary',
      reliability: 'high',
      year: '1965',
      url: 'https://www.cambridge.org/core/books/conquest-of-constantinople',
      notes:
        'The definitive modern scholarly account by one of the foremost Byzantine historians. Runciman synthesizes Byzantine, Ottoman, and Western sources into a comprehensive narrative. Still considered essential reading despite some dated interpretations.',
      dateAdded: '2024-01-18T10:00:00Z',
    },
    {
      id: 'src-003',
      title: '1453: The Holy War for Constantinople and the Clash of Islam and the West',
      author: 'Roger Crowley',
      type: 'secondary',
      reliability: 'high',
      year: '2005',
      url: '',
      notes:
        'Accessible and well-researched popular history that draws on multiple primary sources. Particularly strong on military details and the personal narratives of key figures. Good for documentary storytelling but should be cross-referenced with academic sources.',
      dateAdded: '2024-01-19T14:00:00Z',
    },
    {
      id: 'src-004',
      title: 'De Bello Constantinopolitano — Leonardo of Chios',
      author: 'Leonardo of Chios',
      type: 'primary',
      reliability: 'medium',
      year: '1453',
      url: '',
      notes:
        'Contemporary account by the Archbishop of Lesbos, who was present during the siege. Written in Latin shortly after the events. Contains some exaggerations regarding Ottoman numbers but provides valuable eyewitness details about the defense and the final assault.',
      dateAdded: '2024-01-22T09:00:00Z',
    },
    {
      id: 'src-005',
      title: 'The Ottoman Empire: The Classical Empire 1300–1600',
      author: 'Halil İnalcık',
      type: 'secondary',
      reliability: 'high',
      year: '1973',
      url: '',
      notes:
        'Foundational work by the dean of Ottoman studies. İnalcık provides crucial context on Ottoman military organization, siege technology, and Mehmed II\'s strategic thinking. Essential for understanding the Ottoman perspective and correcting biases in Western and Byzantine sources.',
      dateAdded: '2024-01-25T11:00:00Z',
    },
    {
      id: 'src-006',
      title: 'Memoirs of a Janissary — Konstantin Mihailović',
      author: 'Konstantin Mihailović',
      type: 'primary',
      reliability: 'medium',
      year: 'c. 1501',
      url: '',
      notes:
        'Written by a Serbian Christian who was conscripted into the Ottoman janissary corps. Provides a unique insider perspective on Ottoman military practices, including siege warfare. Written decades after the events, so some details may be conflated with later experiences.',
      dateAdded: '2024-02-01T10:00:00Z',
    },
    {
      id: 'src-007',
      title: 'The Fall of the Byzantine Empire',
      author: 'George Ostrogorsky',
      type: 'secondary',
      reliability: 'high',
      year: '1969',
      url: '',
      notes:
        'Comprehensive survey of Byzantine history with detailed analysis of the empire\'s decline. Provides essential context for understanding why Constantinople was vulnerable in 1453, including the long-term political, economic, and demographic factors.',
      dateAdded: '2024-02-05T15:00:00Z',
    },
  ],
};
