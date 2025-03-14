import { CardSet, CollectionCardEntry, SortField, SortDirection } from '../../types';

/**
 * Common interface for card display components
 */
export interface CardDisplayProps {
  cards: CardSet[] | CollectionCardEntry[];
  onAddCard: (card: CardSet | CollectionCardEntry, quantity: number, isFoil: boolean) => void;
  actionLabel?: string;
  showFoilOption?: boolean;
  foilCardIds?: Set<string>;
  onToggleFoil?: (cardUuid: string, isFoil: boolean) => void;
}

/**
 * Additional props for card list view
 */
export interface CardListViewProps extends CardDisplayProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

/**
 * Interface for paginated views
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
}
