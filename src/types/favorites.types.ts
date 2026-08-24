import type {
  FavoriteList,
  GraphQLClient,
} from '@propeller-commerce/propeller-sdk-v2';

export interface FavoritesOptions {
  graphqlClient: GraphQLClient;
  user: import('@propeller-commerce/propeller-sdk-v2').Contact | import('@propeller-commerce/propeller-sdk-v2').Customer | null;
  language?: string;
}

export interface FavoriteListCreateInput {
  name: string;
  isDefault?: boolean;
}

export interface FavoriteListUpdateInput {
  id: number;
  name?: string;
  isDefault?: boolean;
}

export type FavoriteMutationResult =
  | { success: true; list: FavoriteList }
  | { success: false; error: string };

export type { FavoriteList };
