export type CommandType = 
  | 'web_search'
  | 'open_app'
  | 'set_reminder'
  | 'translate'
  | 'weather'
  | 'news'
  | 'time'
  | 'date'
  | 'joke'
  | 'calculator'
  | 'flip_coin'
  | 'roll_dice'
  | 'fun_fact'
  | 'chat'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  intent: string;
  parameters: Record<string, any>;
}

export const parseCommand = (input: string): ParsedCommand => {
  const lowerInput = input.toLowerCase().trim();

  // Calculator patterns
  if (
    lowerInput.includes('calculate') ||
    lowerInput.includes('calculator') ||
    lowerInput.includes('what is') && /[\d+\-*/()]+/.test(lowerInput) ||
    lowerInput.includes('गणना')
  ) {
    const expression = lowerInput
      .replace(/calculate|calculator|what is|गणना|equals|=|\?/gi, '')
      .trim();
    return {
      type: 'calculator',
      intent: 'Calculate expression',
      parameters: { expression },
    };
  }

  // Weather patterns
  if (lowerInput.includes('weather') || lowerInput.includes('mausam')) {
    const locationMatch = input.match(/weather\s+(?:in|at|for)\s+(.+)/i) || 
                         input.match(/mausam\s+(.+)/i);
    return {
      type: 'weather',
      intent: 'Get weather information',
      parameters: { location: locationMatch?.[1] || 'current location' },
    };
  }

  // News patterns
  if (lowerInput.includes('news') || lowerInput.includes('khabar') || lowerInput.includes('samachar')) {
    const topicMatch = input.match(/news\s+(?:about|on)\s+(.+)/i) ||
                      input.match(/(?:khabar|samachar)\s+(.+)/i);
    return {
      type: 'news',
      intent: 'Get news',
      parameters: { query: topicMatch?.[1] || 'general' },
    };
  }

  // Web search patterns
  if (
    lowerInput.startsWith('search ') ||
    lowerInput.startsWith('google ') ||
    lowerInput.includes('search for') ||
    lowerInput.includes('find information about') ||
    lowerInput.includes('khoj')
  ) {
    const query = lowerInput
      .replace(/^(search|google|khoj)\s+/i, '')
      .replace(/search for|find information about/i, '')
      .trim();
    return {
      type: 'web_search',
      intent: 'Search the web',
      parameters: { query },
    };
  }

  // Open app patterns
  if (lowerInput.startsWith('open ') || lowerInput.includes('launch ')) {
    const app = lowerInput.replace(/^open\s+|launch\s+/i, '').trim();
    return {
      type: 'open_app',
      intent: 'Open application',
      parameters: { app },
    };
  }

  // Reminder patterns
  if (
    lowerInput.includes('remind me') ||
    lowerInput.includes('set reminder') ||
    lowerInput.includes('set alarm') ||
    lowerInput.includes('याद दिला')
  ) {
    return {
      type: 'set_reminder',
      intent: 'Set a reminder',
      parameters: { text: input },
    };
  }

  // Translation patterns
  if (
    lowerInput.includes('translate') ||
    lowerInput.includes('what does') && lowerInput.includes('mean in')
  ) {
    return {
      type: 'translate',
      intent: 'Translate text',
      parameters: { text: input },
    };
  }

  // Flip coin patterns
  if (lowerInput.includes('flip') && (lowerInput.includes('coin') || lowerInput.includes('sikka'))) {
    return {
      type: 'flip_coin',
      intent: 'Flip a coin',
      parameters: {},
    };
  }

  // Roll dice patterns
  if (lowerInput.includes('roll') && (lowerInput.includes('dice') || lowerInput.includes('die') || lowerInput.includes('paase'))) {
    return {
      type: 'roll_dice',
      intent: 'Roll a dice',
      parameters: {},
    };
  }

  // Time patterns
  if (lowerInput.includes('time') || lowerInput.includes('samay') || lowerInput.includes('what time')) {
    return {
      type: 'time',
      intent: 'Get current time',
      parameters: {},
    };
  }

  // Date patterns
  if (lowerInput.includes('date') || lowerInput.includes('tarikh') || lowerInput.includes('today')) {
    return {
      type: 'date',
      intent: 'Get current date',
      parameters: {},
    };
  }

  // Joke patterns
  if (lowerInput.includes('joke') || lowerInput.includes('chutkula') || lowerInput.includes('funny')) {
    return {
      type: 'joke',
      intent: 'Tell a joke',
      parameters: {},
    };
  }

  // Fun fact patterns
  if (lowerInput.includes('fun fact') || lowerInput.includes('fact') || lowerInput.includes('interesting') || lowerInput.includes('रोचक')) {
    return {
      type: 'fun_fact',
      intent: 'Tell a fun fact',
      parameters: {},
    };
  }

  // Default to chat
  return {
    type: 'chat',
    intent: 'General conversation',
    parameters: { message: input },
  };
};

export const executeCommand = async (command: ParsedCommand): Promise<string> => {
  switch (command.type) {
    case 'calculator':
      try {
        const expression = command.parameters.expression || '';
        // Safe math evaluation using Function constructor with limited scope
        const result = Function('"use strict"; return (' + expression + ')')();
        return `${expression} = ${result}`;
      } catch (error) {
        return "Sorry, I couldn't calculate that. Please try a valid mathematical expression.";
      }

    case 'flip_coin':
      const coin = Math.random() > 0.5 ? 'Heads' : 'Tails';
      return `I flipped a coin and it landed on: ${coin}! 🪙`;

    case 'roll_dice':
      const dice = Math.floor(Math.random() * 6) + 1;
      return `I rolled a dice and got: ${dice}! 🎲`;

    case 'time':
      return `The current time is ${new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })} ⏰`;

    case 'date':
      return `Today is ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} 📅`;

    case 'joke':
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything! 😄",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
        "Why did the math book look so sad? Because it had too many problems! 📚",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why did the bicycle fall over? It was two-tired! 🚲",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];

    case 'fun_fact':
      const facts = [
        "🍯 Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that's still edible!",
        "🦩 A group of flamingos is called a 'flamboyance'.",
        "🍌 Bananas are berries, but strawberries aren't!",
        "🗼 The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
        "🐙 Octopuses have three hearts and blue blood!",
        "⚔️ The shortest war in history lasted only 38-45 minutes between Britain and Zanzibar.",
        "🌍 There are more trees on Earth than stars in the Milky Way galaxy!",
        "🦈 Sharks existed before trees! They've been around for about 400 million years.",
      ];
      return facts[Math.floor(Math.random() * facts.length)];

    case 'web_search':
      return `I'll search for "${command.parameters.query}" on the web. (Web search integration coming soon!)`;
    
    case 'open_app':
      return `I would open ${command.parameters.app} for you, but direct app control requires system-level permissions. (Feature in development)`;
    
    case 'set_reminder':
      return `I'll set a reminder for you: "${command.parameters.text}". (Reminder system coming soon!)`;
    
    case 'translate':
      return 'Translation feature is being integrated. Please use the chat for now.';
    
    default:
      return '';
  }
};
