import { useState, useEffect } from 'react';

export const useLastModified = (url: string) => {
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkLastModified = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) throw new Error('Failed to fetch last modified date');
        
        const lastModifiedHeader = response.headers.get('last-modified');
        if (lastModifiedHeader) {
          setLastModified(new Date(lastModifiedHeader));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    checkLastModified();
  }, [url]);

  return { lastModified, isLoading, error };
};
