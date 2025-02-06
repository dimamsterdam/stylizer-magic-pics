export const productImages = {
  'cream-button-up': {
    id: 'CBS005',
    title: 'Cream Button-Up Shirt',
    main: '/lovable-uploads/products/cream-button-up/main.png',
    details: '/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png',
    generated: [
      {
        id: 'af88ce94',
        url: '/lovable-uploads/generated/cream-button-up/urban-1.png',
        type: 'urban'
      },
      {
        id: '61d9b435',
        url: '/lovable-uploads/generated/cream-button-up/urban-2.png',
        type: 'urban'
      }
    ]
  },
  'cream-sweater': {
    id: 'CS004',
    title: 'Classic Cream Sweater',
    main: '/lovable-uploads/products/cream-sweater/main.png',
    details: '/lovable-uploads/01c51803-441a-4b90-ad49-fc25ca184153.png',
    generated: [
      {
        id: '047c9307',
        url: '/lovable-uploads/generated/cream-sweater/lifestyle-1.png',
        type: 'lifestyle'
      },
      {
        id: '01c51803',
        url: '/lovable-uploads/generated/cream-sweater/lifestyle-2.png',
        type: 'lifestyle'
      },
      {
        id: '12022501',
        url: '/lovable-uploads/generated/cream-sweater/urban-1.png',
        type: 'urban'
      }
    ]
  }
};

export type ProductKey = keyof typeof productImages;