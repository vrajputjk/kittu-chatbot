export interface Animal {
  id: string;
  name: string;
  sound: string;
  imageUrl: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const animals: Animal[] = [
  {
    id: '1',
    name: 'Lion',
    sound: '🦁 Roar!',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400',
    description: 'The king of the jungle with a mighty roar',
    difficulty: 'easy',
  },
  {
    id: '2',
    name: 'Elephant',
    sound: '🐘 Trumpet!',
    imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400',
    description: 'Large mammal with a distinctive trumpet call',
    difficulty: 'easy',
  },
  {
    id: '3',
    name: 'Dog',
    sound: '🐕 Woof! Woof!',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    description: "Human's best friend that barks",
    difficulty: 'easy',
  },
  {
    id: '4',
    name: 'Cat',
    sound: '🐈 Meow!',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    description: 'Purring feline that meows',
    difficulty: 'easy',
  },
  {
    id: '5',
    name: 'Cow',
    sound: '🐄 Moo!',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
    description: 'Farm animal known for mooing',
    difficulty: 'easy',
  },
  {
    id: '6',
    name: 'Owl',
    sound: '🦉 Hoot! Hoot!',
    imageUrl: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=400',
    description: 'Nocturnal bird with a distinctive hoot',
    difficulty: 'medium',
  },
  {
    id: '7',
    name: 'Wolf',
    sound: '🐺 Howl!',
    imageUrl: 'https://images.unsplash.com/photo-1554692918-3e3c3c2b9a1e?w=400',
    description: 'Wild canine that howls at the moon',
    difficulty: 'medium',
  },
  {
    id: '8',
    name: 'Dolphin',
    sound: '🐬 Click-click!',
    imageUrl: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=400',
    description: 'Intelligent marine mammal with clicking sounds',
    difficulty: 'hard',
  },
  {
    id: '9',
    name: 'Frog',
    sound: '🐸 Ribbit!',
    imageUrl: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=400',
    description: 'Amphibian that ribbits',
    difficulty: 'medium',
  },
  {
    id: '10',
    name: 'Rooster',
    sound: '🐓 Cock-a-doodle-doo!',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
    description: 'Farm bird that crows at dawn',
    difficulty: 'medium',
  },
];
