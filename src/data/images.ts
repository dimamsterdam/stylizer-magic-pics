export const productImages = {
  'cream-button-up': {
    id: 'CBS005',
    title: 'Cream Button-Up Shirt',
    main: '/products/cream-button-up/main.png',
    details: '/products/cream-button-up/details.png',
    generated: [
      {
        id: 'af88ce94',
        url: '/generated/cream-button-up/urban-001.png',
        type: 'urban'
      },
      {
        id: '61d9b435',
        url: '/generated/cream-button-up/urban-002.png',
        type: 'urban'
      }
    ]
  },
  'cream-sweater': {
    id: 'CS004',
    title: 'Classic Cream Sweater',
    main: '/products/cream-sweater/main.png',
    details: '/products/cream-sweater/details.png',
    generated: [
      {
        id: '047c9307',
        url: '/generated/cream-sweater/lifestyle-001.png',
        type: 'lifestyle'
      },
      {
        id: '01c51803',
        url: '/generated/cream-sweater/lifestyle-002.png',
        type: 'lifestyle'
      },
      {
        id: '12022501',
        url: '/generated/cream-sweater/urban-001.png',
        type: 'urban'
      }
    ]
  }
};

export type ProductKey = keyof typeof productImages;