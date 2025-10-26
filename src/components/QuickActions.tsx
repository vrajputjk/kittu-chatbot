import { Button } from '@/components/ui/button';
import { Eraser, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QuickActionsProps = {
  onClearChat: () => void;
  messages: any[];
};

export const QuickActions = ({ onClearChat, messages }: QuickActionsProps) => {
  const { toast } = useToast();

  const handleExportChat = () => {
    const chatContent = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Chat exported',
      description: 'Your conversation has been downloaded.',
    });
  };

  return (
    <div className="flex gap-2">
      {messages.length > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportChat}
            className="hover:bg-google-blue/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearChat}
            className="hover:bg-google-red/10"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
};
