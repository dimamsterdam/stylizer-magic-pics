export const productImages = {
  'cream-button-up': {
    id: 'CBS005',
    title: 'Cream Button-Up Shirt',
    main: '/products/cream-button-up/main.png',
    details: '/products/cream-button-up/details.png',
    generated: [
      {
        id: 'af88ce94',
        url: '/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png',
        type: 'urban'
      },
      {
        id: '61d9b435',
        url: '/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png',
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
        url: '/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png',
        type: 'lifestyle'
      },
      {
        id: '01c51803',
        url: '/lovable-uploads/01c51803-441a-4b90-ad49-fc25ca184153.png',
        type: 'lifestyle'
      },
      {
        id: '12022501',
        url: '/lovable-uploads/12022501-6211-4169-ad19-4d93700c8c9f.png',
        type: 'urban'
      }
    ]
  }
};

export type ProductKey = keyof typeof productImages;