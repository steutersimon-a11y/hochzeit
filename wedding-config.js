/* Alle Angaben können hier ersetzt werden. Keine Installation nötig.
   Namen, Hochzeitsdatum und Locations sind bestätigt.
   Zeiten, Rückmeldefrist und weitere Details sind Design-Platzhalter. */
window.WEDDING = {
  names: ['Marie', 'Simon'],
  date: '2027-08-28',
  dateLabel: '28. August 2027',
  weekday: 'Samstag',
  region: 'Schermbeck',
  invitation: 'Ein Tag voller Liebe.\nUnd ihr mittendrin.',
  intro: 'Aus einem kleinen Wir wird ein großes Für immer. Wir heiraten – und möchten diesen besonderen Tag mit den Menschen feiern, die unser Leben schöner machen. Mit euch.',
  quote: 'Mit dir fühlt sich jeder Ort\nwie Zuhause an.',
  story: 'Manchmal beginnt das größte Abenteuer ganz leise. Mit einem Blick, einem Lachen und dem Gefühl, angekommen zu sein. Jetzt sagen wir Ja – zu uns, zu allem, was kommt, und zu einem Leben voller gemeinsamer Geschichten.',
  photos: {
    couple: '', // 'assets/images/paar.jpg'
    hands: '', // 'assets/images/haende.jpg'
    church: '', // 'assets/images/kirche-stickerei.jpg'
    party: '', // 'assets/images/mago.jpg'
  },
  ceremony: {
    name: 'Reformierte Kirche',
    type: 'Unsere standesamtliche Trauung',
    time: '14:00 Uhr',
    arrival: 'Ankommen ab 13:30 Uhr',
    address: 'Schermbeck · die genaue Adresse folgt',
    mapQuery: 'Reformierte Kirche Schermbeck',
    text: 'Hier beginnt unser Für immer. Seid dabei, wenn aus zwei Geschichten eine gemeinsame wird.'
  },
  party: {
    name: 'Mago Restaurant & Bar',
    type: 'Dinner, Drinks & Dancing',
    time: '17:00 Uhr',
    arrival: 'Ein Abend, der bleiben darf',
    address: 'Schermbeck · die genaue Adresse folgt',
    mapQuery: 'Mago Restaurant und Bar Schermbeck',
    text: 'Gute Gespräche, ein festliches Dinner und die Tanzfläche voller Lieblingsmenschen. Wir feiern mit euch bis in die Nacht.'
  },
  timeline: [
    { time: '13:30', title: 'Hallo, Lieblingsmenschen', text: 'Ankommen an der Reformierten Kirche.', icon: 'sun' },
    { time: '14:00', title: 'Ein kleines Wort. Für immer.', text: 'Unsere standesamtliche Trauung.', icon: 'rings' },
    { time: '15:00', title: 'Auf die Liebe', text: 'Anstoßen, Umarmungen und gemeinsame Fotos.', icon: 'glasses' },
    { time: '17:00', title: 'Bienvenue bei Mago', text: 'Aperitif im Mago Restaurant & Bar.', icon: 'leaf' },
    { time: '18:00', title: 'Ein Tisch voller Geschichten', text: 'Zeit für ein festliches Dinner.', icon: 'dinner' },
    { time: '20:30', title: 'Barfuß wäre auch okay', text: 'Erster Tanz. Gute Musik. Eine lange Nacht.', icon: 'music' }
  ],
  details: [
    { title: 'Was ziehen wir an?', text: 'Festlich & entspannt. Zarte Farben, leichte Stoffe und etwas, in dem ihr euch wohlfühlt. Bringt eure schönsten Tanzschuhe mit.' },
    { title: 'Wie kommen wir hin?', text: 'Beide Locations liegen in Schermbeck. Details zu Parkplätzen und einem möglichen Shuttle ergänzen wir hier rechtzeitig.' },
    { title: 'Wo können wir bleiben?', text: 'Macht ein kleines Wochenende daraus. Unsere Hotelempfehlungen und Informationen zu reservierten Zimmern folgen hier.' },
    { title: 'Ein Geschenk für euch?', text: 'Das schönste Geschenk ist, dass ihr dabei seid. Wer uns darüber hinaus eine Freude machen möchte, darf etwas zu unserer nächsten gemeinsamen Reise beitragen.' },
    { title: 'Kinder, Essen & Wünsche', text: 'Sagt uns bei eurer Rückmeldung gern, mit wem ihr kommt und ob wir Allergien, vegetarische Wünsche oder andere Bedürfnisse berücksichtigen dürfen.' },
    { title: 'Noch eine Frage?', text: 'Unsere Kontaktdaten und die unserer Trauzeugen ergänzen wir hier. Bis dahin: Wir freuen uns auf euch!' }
  ],
  rsvpDeadline: '1. Mai 2027',
  rsvpEmail: '', // Später eure echte E-Mail eintragen; Antworten werden als E-Mail vorbereitet.
  calendar: { startTime: '14:00', endTime: '23:59', timezone: 'Europe/Berlin' },
  footer: 'Mit Liebe geplant. Mit euch unvergesslich.'
};
