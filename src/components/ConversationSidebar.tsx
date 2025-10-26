import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ConversationSidebarProps = {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
};

export const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationSidebarProps) => {
  return (
    <div className="w-64 border-r border-border/30 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/30">
        <Button 
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-google-blue via-google-red to-google-yellow hover:opacity-90"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all",
                currentConversationId === conversation.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{conversation.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
