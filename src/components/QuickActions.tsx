import { Button } from '@/components/ui/button';
import { Eraser, Download, FileText, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type QuickActionsProps = {
  onClearChat: () => void;
  messages: Message[];
};

export const QuickActions = ({ onClearChat, messages }: QuickActionsProps) => {
  const { toast } = useToast();

  const formatTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportTxt = () => {
    const header = `Kittu AI Assistant - Chat Export\nExported: ${formatTimestamp()}\n${'='.repeat(50)}\n\n`;
    const chatContent = messages
      .map((msg) => {
        const role = msg.role === 'user' ? '👤 You' : '🤖 Kittu';
        return `${role}:\n${msg.content}\n`;
      })
      .join('\n');
    
    const blob = new Blob([header + chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kittu-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Chat exported',
      description: 'Downloaded as text file.',
    });
  };

  const handleExportJson = () => {
    const exportData = {
      assistant: 'Kittu AI',
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((msg, index) => ({
        id: index + 1,
        role: msg.role,
        content: msg.content,
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kittu-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Chat exported',
      description: 'Downloaded as JSON file.',
    });
  };

  const handleExportMarkdown = () => {
    const header = `# Kittu AI Assistant - Chat Export\n\n**Exported:** ${formatTimestamp()}\n\n---\n\n`;
    const chatContent = messages
      .map((msg) => {
        const role = msg.role === 'user' ? '### 👤 You' : '### 🤖 Kittu';
        return `${role}\n\n${msg.content}\n`;
      })
      .join('\n---\n\n');
    
    const blob = new Blob([header + chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kittu-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Chat exported',
      description: 'Downloaded as Markdown file.',
    });
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportTxt}>
            <FileText className="w-4 h-4 mr-2" />
            Download as Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown}>
            <FileText className="w-4 h-4 mr-2" />
            Download as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJson}>
            <FileJson className="w-4 h-4 mr-2" />
            Download as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearChat}
        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
      >
        <Eraser className="w-4 h-4" />
      </Button>
    </div>
  );
};
