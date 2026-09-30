export const COTTAGE_ARTWORK: Record<string, string> = {
  'panoramic hut': '/panoramic-hut.svg',
  "stargazer's den": '/stargazer-den.svg',
  'family hut': '/family-hut.svg',
  'mountain suite': '/mountain-suite.svg',
}

export const EXPERIENCE_ARTWORK: Record<string, string> = {
  'night city lights': '/night-city-lights.svg',
}

export const PRODUCT_ARTWORK: Record<string, string> = {
  'choke mountains community shirt': '/kok.jpg',
}

export function artworkFor(name: string, artwork: Record<string, string>) {
  return artwork[name.trim().toLowerCase()]
}
