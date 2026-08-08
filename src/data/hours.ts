export interface DayHours {
  /** JS getDay() index: 0 = Sunday */
  dayIndex: number
  label: string
  hours: string
  djFest?: boolean
}

export const openingHours: DayHours[] = [
  { dayIndex: 1, label: 'Lundi', hours: '12h00 – 00h00' },
  { dayIndex: 2, label: 'Mardi', hours: '12h00 – 00h00' },
  { dayIndex: 3, label: 'Mercredi', hours: '12h00 – 00h00' },
  { dayIndex: 4, label: 'Jeudi', hours: '12h00 – 00h00' },
  { dayIndex: 5, label: 'Vendredi', hours: '12h00 – 00h00' },
  { dayIndex: 6, label: 'Samedi', hours: '12h00 – 00h00' },
  { dayIndex: 0, label: 'Dimanche', hours: '12h00 – 00h00' },
]

export const CONTACT = {
  phone: '+237 6 98 43 43 43',
  phoneHref: 'tel:+237698434343',
  phoneReservations: '+237 6 70 85 85 85',
  phoneReservationsHref: 'tel:+237670858585',
  instagram: 'https://www.instagram.com/lamarquisedouala/',
  instagramHandle: '@lamarquisedouala',
  facebook: 'https://www.facebook.com/LaMarquiseRestaurant/',
  facebookHandle: 'La Marquise Restaurant',
  tripadvisor: 'https://www.tripadvisor.fr/Restaurant_Review-g297392-d23352527-Reviews-La_Marquise_Restaurant-Douala_Littoral_Region.html',
  address: {
    street: 'Rue Tokoto',
    district: 'Bonapriso',
    note: '',
    city: 'Douala, Cameroun',
  },
  mapsDirections:
    'https://maps.google.com/?q=La+Marquise+Restaurant+Bonapriso+Douala+Cameroun',
  mapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.8!2d9.69!3d4.02!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDEnMTIuMCJOIDnCsDQxJzI0LjAiRQ!5e0!3m2!1sfr!2scm!4v1',
} as const
