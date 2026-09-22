import type { SearchDocument } from './index';
let pending: Promise<SearchDocument[]> | undefined;
export function loadSearchIndex(): Promise<SearchDocument[]> {
  return (pending ??= fetch('/search-index.json')
    .then(async (response) => {
      if (!response.ok) throw new Error('Could not load search. Please try again.');
      return response.json() as Promise<SearchDocument[]>;
    })
    .catch((error) => {
      pending = undefined;
      throw error;
    }));
}
