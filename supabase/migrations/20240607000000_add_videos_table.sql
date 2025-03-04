
-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    product_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    is_generated BOOLEAN DEFAULT FALSE,
    prompt TEXT,
    style TEXT,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for updated_at on videos table
CREATE TRIGGER videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Security policies for videos table
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to select their own videos"
ON public.videos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own videos"
ON public.videos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own videos"
ON public.videos
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own videos"
ON public.videos
FOR DELETE
USING (auth.uid() = user_id);
