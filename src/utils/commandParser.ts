export type CommandType = 
  | 'web_search'
  | 'open_app'
  | 'set_reminder'
  | 'translate'
  | 'chat'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  intent: string;
  parameters: Record<string, any>;
}

export const parseCommand = (input: string): ParsedCommand => {
  const lowerInput = input.toLowerCase().trim();

  // Web search patterns
  if (
    lowerInput.startsWith('search ') ||
    lowerInput.startsWith('google ') ||
    lowerInput.includes('search for') ||
    lowerInput.includes('find information about')
  ) {
    const query = lowerInput
      .replace(/^(search|google)\s+/i, '')
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
    lowerInput.includes('set alarm')
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

  // Default to chat
  return {
    type: 'chat',
    intent: 'General conversation',
    parameters: { message: input },
  };
};

export const executeCommand = async (command: ParsedCommand): Promise<string> => {
  switch (command.type) {
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
