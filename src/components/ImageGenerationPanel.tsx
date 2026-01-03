import { useState } from 'react';
import { X, Sparkles, Download, Loader2, ImageIcon, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageGenerationPanelProps {
  onClose: () => void;
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

export const ImageGenerationPanel = ({ onClose, onImageGenerated }: ImageGenerationPanelProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const examplePrompts = [
    "A magical sunset over mountains with aurora borealis",
    "A cute robot learning to paint in a cozy studio",
    "An underwater city with bioluminescent buildings",
    "A steampunk flying machine above the clouds",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: 'Describe the image you want to create.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onImageGenerated?.(data.imageUrl, prompt);
        toast({
          title: 'Image generated!',
          description: 'Your image has been created successfully.',
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error: unknown) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `kittu-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Image downloaded',
      description: 'Your image has been saved.',
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--google-blue))] to-[hsl(var(--google-red))] flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Image Generation</h2>
              <p className="text-sm text-muted-foreground">Create images with AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Describe your image</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A magical castle floating in the clouds..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Example prompts */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example.slice(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-[hsl(var(--google-blue))] to-[hsl(var(--google-red))] hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {/* Generated image */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={generatedImage}
                  alt={prompt}
                  className="w-full h-auto"
                />
              </div>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && !generatedImage && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(var(--google-blue))] via-[hsl(var(--google-red))] to-[hsl(var(--google-yellow))] animate-spin" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">Creating your masterpiece...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
