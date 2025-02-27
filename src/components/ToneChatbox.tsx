
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  preview?: {
    headline?: string;
    bodyCopy?: string;
  };
}

interface ToneChatboxProps {
  onToneChange: (updates: { headline: string; bodyCopy: string }) => void;
  currentHeadline: string;
  currentBodyCopy: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_SUGGESTIONS = [
  "Make it more professional",
  "Add a casual tone",
  "Make it more luxurious",
  "Add fashion-specific terms",
  "Make it more persuasive"
];

export function ToneChatbox({
  onToneChange,
  currentHeadline,
  currentBodyCopy,
  isOpen,
  onOpenChange
}: ToneChatboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: "Hello! How would you like to adjust the tone of your text?",
          timestamp: new Date(),
          preview: {
            headline: currentHeadline,
            bodyCopy: currentBodyCopy
          }
        }
      ]);
    }
  }, [isOpen, currentHeadline, currentBodyCopy]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-tone-chat', {
        body: {
          message: content,
          currentHeadline,
          currentBodyCopy,
          chatHistory: messages.map(m => ({
            role: m.type,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: data.message,
        timestamp: new Date(),
        preview: {
          headline: data.updatedHeadline,
          bodyCopy: data.updatedBodyCopy
        }
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Automatically apply changes when receiving AI response
      if (data.updatedHeadline || data.updatedBodyCopy) {
        onToneChange({
          headline: data.updatedHeadline || currentHeadline,
          bodyCopy: data.updatedBodyCopy || currentBodyCopy
        });
        toast({
          title: "Text updated",
          description: "The tone adjustments have been applied.",
        });
      }
    } catch (error) {
      console.error('Error processing chat:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // We're removing the button completely, so we only render the chat interface when it's open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="font-semibold text-lg">Adjust Your Text</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col space-y-2",
                message.type === 'user' ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                {message.preview && (
                  <div className="mt-2 text-xs border-t pt-2">
                    <p className="font-semibold">{message.preview.headline}</p>
                    <p className="mt-1">{message.preview.bodyCopy}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isProcessing}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your tone adjustment..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            disabled={isProcessing}
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isProcessing || !inputValue.trim()}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
